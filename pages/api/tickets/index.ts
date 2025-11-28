import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { InsertOneResult, Db } from "mongodb";

// Define the expected structure for incoming ticket data
interface IncomingTicketData {
  Fullname: string;
  department: string;
  dateSched: string;
  type: string;
  status: "Pending" | "Ongoing" | "Finished" | string;
  remarks: string;
  processedBy: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  requesttype: string;
  mode: string;
  site: string;
  group: string;
  technicianname: string;
  ticketNumber?: string;
  id?: string;
  createdAt?: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // 1. Database Connection
  let db: Db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(503).json({ success: false, message: 'Service Unavailable: Failed to connect to database.' });
  }

  const ticketsCollection = db.collection<IncomingTicketData>("tickets");

  // ----------------------------------------------------------------------
  // --- 🚀 Handle GET Request (Fetch All Tickets) ---
  // ----------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const tickets = await ticketsCollection.find({})
        .sort({ createdAt: -1 })
        .toArray();

      const formattedTickets = tickets.map(ticket => ({
        id: ticket.ticketNumber || ticket._id.toHexString(),
        employeeName: ticket.Fullname,
        department: ticket.department,
        type: ticket.type,
        remarks: ticket.remarks,
        dateCreated: ticket.createdAt ? ticket.createdAt.toISOString() : 'N/A',
        priority: ticket.priority,
        status: ticket.status as ("Pending" | "Ongoing" | "Finished"),
        ticketNumber: ticket.ticketNumber
      }));

      return res.status(200).json({
        success: true,
        data: formattedTickets,
        message: 'Tickets fetched successfully.'
      });

    } catch (error) {
      console.error('Ticket fetching failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during ticket fetching.';
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ----------------------------------------------------------------------
  // --- 📝 Handle POST Request (Create New Ticket) --- (UPDATED LOGIC)
  // ----------------------------------------------------------------------
  else if (req.method === 'POST') {
    try {
      const ticketData: IncomingTicketData = req.body;

      // Required fields
      if (!ticketData.Fullname || !ticketData.department || !ticketData.requesttype || !ticketData.remarks) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Fullname, department, request type, and remarks are mandatory."
        });
      }

      // ------------------------------
      // 1️⃣ CREATE NEW TICKET NUMBER FORMAT: DSI-YYYY-MM-DD-COUNT
      // ------------------------------
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const today = `${year}-${month}-${day}`;

      // Count how many tickets exist today
      const todaysCount = await ticketsCollection.countDocuments({
        createdAt: {
          $gte: new Date(`${today}T00:00:00.000Z`),
          $lte: new Date(`${today}T23:59:59.999Z`)
        }
      });

      // Build final ticket number
      const formattedTicketNumber = `DSI-${today}-${todaysCount + 1}`;

      // ------------------------------
      // 2️⃣ PREPARE NEW TICKET DATA
      // ------------------------------
      const newTicket: IncomingTicketData = {
        ...ticketData,
        status: ticketData.status || "Pending",
        ticketNumber: formattedTicketNumber,
        createdAt: new Date(),
      };

      // ------------------------------
      // 3️⃣ INSERT INTO DATABASE
      // ------------------------------
      const result: InsertOneResult = await ticketsCollection.insertOne(newTicket);

      if (result.acknowledged) {
        return res.status(201).json({
          success: true,
          message: `Ticket ${formattedTicketNumber} created successfully.`,
          ticketNumber: formattedTicketNumber,
          insertedId: result.insertedId,
        });
      } else {
        throw new Error("Database insertion failed.");
      }

    } catch (error) {
      console.error("Ticket creation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during ticket creation.";
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ----------------------------------------------------------------------
  // --- 🚫 Handle Unsupported Methods ---
  // ----------------------------------------------------------------------
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

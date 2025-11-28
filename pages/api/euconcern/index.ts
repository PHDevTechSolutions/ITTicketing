import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { InsertOneResult, Db } from "mongodb";

// Define the expected structure for incoming Concern data
interface IncomingConcernData {
  Fullname: string;
  department: string;
  dateSched: string;
  type: string;
  remarks: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  requesttype: string;
  mode: string;
  site: string;
  ConcernNumber?: string;
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

  const ConcernsCollection = db.collection<IncomingConcernData>("concerns");

  // ----------------------------------------------------------------------
  // --- 🚀 Handle GET Request (Fetch All Concerns) ---
  // ----------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      const Concerns = await ConcernsCollection.find({})
        .sort({ createdAt: -1 })
        .toArray();

      const formattedConcerns = Concerns.map(Concern => ({
        id: Concern.ConcernNumber || Concern._id.toHexString(),
        employeeName: Concern.Fullname,
        department: Concern.department,
        type: Concern.type,
        remarks: Concern.remarks,
        dateCreated: Concern.createdAt ? Concern.createdAt.toISOString() : 'N/A',
        priority: Concern.priority,
        ConcernNumber: Concern.ConcernNumber
      }));

      return res.status(200).json({
        success: true,
        data: formattedConcerns,
        message: 'Concerns fetched successfully.'
      });

    } catch (error) {
      console.error('Concern fetching failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during Concern fetching.';
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ----------------------------------------------------------------------
  // --- 📝 Handle POST Request (Create New Concern) --- (UPDATED LOGIC)
  // ----------------------------------------------------------------------
  else if (req.method === 'POST') {
    try {
      const ConcernData: IncomingConcernData = req.body;

      // Required fields
      if (!ConcernData.Fullname || !ConcernData.department || !ConcernData.requesttype || !ConcernData.remarks) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Fullname, department, request type, and remarks are mandatory."
        });
      }

      // ------------------------------
      // 1️⃣ CREATE NEW Concern NUMBER FORMAT: DSI-YYYY-MM-DD-COUNT
      // ------------------------------
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const today = `${year}-${month}-${day}`;

      // Count how many Concerns exist today
      const todaysCount = await ConcernsCollection.countDocuments({
        createdAt: {
          $gte: new Date(`${today}T00:00:00.000Z`),
          $lte: new Date(`${today}T23:59:59.999Z`)
        }
      });

      // Build final Concern number
      const formattedConcernNumber = `DSI-${today}-${todaysCount + 1}`;

      // ------------------------------
      // 2️⃣ PREPARE NEW Concern DATA
      // ------------------------------
      const newConcern: IncomingConcernData = {
        ...ConcernData,
        ConcernNumber: formattedConcernNumber,
        createdAt: new Date(),
      };

      // ------------------------------
      // 3️⃣ INSERT INTO DATABASE
      // ------------------------------
      const result: InsertOneResult = await ConcernsCollection.insertOne(newConcern);

      if (result.acknowledged) {
        return res.status(201).json({
          success: true,
          message: `Concern ${formattedConcernNumber} created successfully.`,
          ConcernNumber: formattedConcernNumber,
          insertedId: result.insertedId,
        });
      } else {
        throw new Error("Database insertion failed.");
      }

    } catch (error) {
      console.error("Concern creation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during Concern creation.";
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

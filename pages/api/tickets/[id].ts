import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Ticket structure
interface ITicketData {
  Fullname: string;
  department: string;
  type: string;
  status: "Pending" | "Ongoing" | "Finished" | string;
  remarks: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  ticketNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, message: "Missing or invalid ticket ID." });
  }

  // Validate ObjectId
  let objectId: ObjectId | null = null;
  try {
    objectId = new ObjectId(id);
  } catch (e) {
    objectId = null;
  }

  // Filter to match _id or ticketNumber
  const filter: any = objectId
    ? { $or: [{ _id: objectId }, { ticketNumber: id }] }
    : { ticketNumber: id };

  // Connect to MongoDB
  let db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(503).json({ success: false, message: "Service Unavailable: Failed to connect to database." });
  }

  const ticketsCollection = db.collection<ITicketData>("tickets");

  // ---------------- DELETE ----------------
  if (req.method === "DELETE") {
    try {
      console.log("Filter used for deletion:", filter);
      const result = await ticketsCollection.deleteOne(filter);
      console.log("Deletion result:", result);

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: `Ticket with ID/Number ${id} not found.` });
      }

      return res.status(200).json({ success: true, message: `Ticket ${id} successfully deleted.` });
    } catch (error) {
      console.error(`Ticket ${id} deletion failed:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ---------------- PUT ----------------
  else if (req.method === "PUT") {
    try {
      const updateData = req.body;
      const { status, ...otherUpdates } = updateData;

      const updatePayload: any = { ...otherUpdates };

      if (status) {
        if (["Pending", "Ongoing", "Finished"].includes(status)) {
          updatePayload.status = status;
        } else {
          return res.status(400).json({ success: false, message: "Invalid status value." });
        }
      }

      updatePayload.updatedAt = new Date();

      console.log("Update payload:", updatePayload);

      const result = await ticketsCollection.updateOne(filter, { $set: updatePayload });
      console.log("Update result:", result);

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: `Ticket with ID/Number ${id} not found.` });
      }

      return res.status(200).json({
        success: true,
        message: `Ticket ${id} successfully updated.`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error(`Ticket ${id} update failed:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ---------------- GET ----------------
  else if (req.method === "GET") {
    try {
      const ticket = await ticketsCollection.findOne(filter);

      if (!ticket) {
        return res.status(404).json({ success: false, message: `Ticket with ID/Number ${id} not found.` });
      }

      const formattedTicket = {
        id: ticket.ticketNumber || ticket._id.toHexString(),
        employeeName: ticket.Fullname,
        department: ticket.department,
        type: ticket.type,
        remarks: ticket.remarks,
        dateCreated: ticket.createdAt ? ticket.createdAt.toISOString() : "N/A",
        priority: ticket.priority,
        status: ticket.status as "Pending" | "Ongoing" | "Finished",
        ticketNumber: ticket.ticketNumber,
      };

      return res.status(200).json({ success: true, data: formattedTicket, message: `Ticket ${id} fetched successfully.` });
    } catch (error) {
      console.error(`Ticket ${id} fetching failed:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({ success: false, message: `Internal server error: ${errorMessage}` });
    }
  }

  // ---------------- Unsupported Methods ----------------
  else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

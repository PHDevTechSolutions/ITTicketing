import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId, Db } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

interface IncomingConcernData {
  Fullname: string;
  department: string;
  dateSched: string;
  type: string;
  remarks: string;
  priority: string;
  requesttype: string;
  mode: string;
  site: string;
  ConcernNumber?: string;
  createdAt?: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ----------------------------
  // Connect to database
  // ----------------------------
  let db: Db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    console.error("DB connection failed:", error);
    return res.status(503).json({ success: false, message: "Database connection failed." });
  }

  const collection = db.collection<IncomingConcernData>("concerns");

  // Get ID from URL
  const { id } = req.query;

  if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid MongoDB ObjectId." });
  }

  const objectId = new ObjectId(id);

  // =========================
  // GET - Fetch single concern
  // =========================
  if (req.method === "GET") {
    try {
      const concern = await collection.findOne({ _id: objectId });
      if (!concern) {
        return res.status(404).json({ success: false, message: "Concern not found." });
      }
      return res.status(200).json({ success: true, data: concern });
    } catch (error) {
      console.error("GET error:", error);
      return res.status(500).json({ success: false, message: "Error fetching concern." });
    }
  }

  // =========================
  // PUT - Update concern
  // =========================
  if (req.method === "PUT") {
    try {
      const updatedData = req.body;

      // Validate required fields
      const REQUIRED = ["Fullname", "department", "requesttype", "remarks"];
      for (const field of REQUIRED) {
        if (!updatedData[field]) {
          return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
      }

      const updatePayload = {
        $set: {
          Fullname: updatedData.Fullname,
          department: updatedData.department,
          dateSched: updatedData.dateSched,
          type: updatedData.type,
          remarks: updatedData.remarks,
          priority: updatedData.priority,
          requesttype: updatedData.requesttype,
          mode: updatedData.mode,
          site: updatedData.site,
        },
      };

      const result = await collection.updateOne({ _id: objectId }, updatePayload);

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Concern not found." });
      }

      return res.status(200).json({ success: true, message: "Concern updated successfully." });
    } catch (error) {
      console.error("PUT error:", error);
      return res.status(500).json({ success: false, message: "Update failed." });
    }
  }

  // =========================
  // DELETE - Remove concern
  // =========================
  if (req.method === "DELETE") {
    try {
      const result = await collection.deleteOne({ _id: objectId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Concern not found." });
      }
      return res.status(200).json({ success: true, message: "Concern deleted successfully." });
    } catch (error) {
      console.error("DELETE error:", error);
      return res.status(500).json({ success: false, message: "Delete failed." });
    }
  }

  // =========================
  // Unsupported methods
  // =========================
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ success: false, message: `Method ${req.method} not allowed.` });
}

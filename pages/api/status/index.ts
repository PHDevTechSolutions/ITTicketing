import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const statusCollection = db.collection("status");

    switch (req.method) {
      case "GET": {
        // Kunin lahat ng sites
        const status = await statusCollection.find().toArray();

        return res.status(200).json({
          success: true,
          data: status,
        });
      }

      case "POST": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate
        const existing = await statusCollection.findOne({ name: trimmedName });
        if (existing) {
          return res.status(409).json({ success: false, message: "Status name already exists." });
        }

        const insertResult = await statusCollection.insertOne({ name: trimmedName });

        return res.status(201).json({
          success: true,
          message: "Status created successfully",
          data: { _id: insertResult.insertedId, name: trimmedName },
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Status index API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const priorityCollection = db.collection("priority");

    switch (req.method) {
      // GET all priorities
      case "GET": {
        const priorities = await priorityCollection.find().toArray();
        return res.status(200).json({ success: true, data: priorities });
      }

      // POST create new priority
      case "POST": {
        const { name } = req.body;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        const existing = await priorityCollection.findOne({ name: trimmedName });
        if (existing) {
          return res.status(409).json({ success: false, message: "Priority name already exists." });
        }

        const insertResult = await priorityCollection.insertOne({ name: trimmedName });

        return res.status(201).json({
          success: true,
          message: "Priority created successfully.",
          data: { _id: insertResult.insertedId, name: trimmedName },
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Priority index API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

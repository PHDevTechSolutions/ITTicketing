import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId, WithId } from "mongodb";

// Interface para sa 'Mode' document
interface Mode {
  name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const modeCollection = db.collection<Mode>("mode");

    switch (req.method) {
      case "GET": {
        // Kumuha ng lahat ng Mode of Service, i-sort by name
        const modes = await modeCollection.find({}).sort({ name: 1 }).toArray();
        
        return res.status(200).json({ success: true, data: modes });
      }

      case "POST": {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({ success: false, message: "Mode name is required and must be a string." });
        }

        const trimmedName = name.trim();

        // 1. Check kung existing na ang Mode (Duplicate Check)
        const existing = await modeCollection.findOne({ name: trimmedName });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Mode name already exists. Please choose a different name.",
          });
        }

        // 2. Insert the new document
        const result = await modeCollection.insertOne({ name: trimmedName });

        if (!result.acknowledged) {
            return res.status(500).json({ success: false, message: "Failed to create mode." });
        }
        
        // Ibalik ang bagong document kasama ang generated ID
        const newMode = await modeCollection.findOne({ _id: result.insertedId });

        return res.status(201).json({
          success: true,
          message: "Mode created successfully.",
          data: newMode,
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Mode API error (Index):", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}
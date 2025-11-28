import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { WithId } from "mongodb";

// Interface para sa 'Group' document
interface Group {
  name: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const groupCollection = db.collection<Group>("group"); // 🎯 Assuming your collection name is 'groups'

    switch (req.method) {
      case "GET": {
        // Kumuha ng lahat ng Group, i-sort by name
        const groups = await groupCollection.find({}).sort({ name: 1 }).toArray();
        return res.status(200).json({ success: true, data: groups });
      }

      case "POST": {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({ success: false, message: "Group name is required." });
        }

        const trimmedName = name.trim();

        // 1. Check for duplicate name
        const existing = await groupCollection.findOne({ name: trimmedName });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Group name already exists. Please choose a different name.",
          });
        }

        // 2. Insert the new document
        const result = await groupCollection.insertOne({ name: trimmedName });

        if (!result.acknowledged) {
            return res.status(500).json({ success: false, message: "Failed to create Group." });
        }
        
        // Ibalik ang bagong document kasama ang generated ID
        const newGroup = await groupCollection.findOne({ _id: result.insertedId });

        return res.status(201).json({
          success: true,
          message: "Group created successfully.",
          data: newGroup,
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Group API error (Index):", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const siteCollection = db.collection("site");

    switch (req.method) {
      case "GET": {
        // Kunin lahat ng sites
        const sites = await siteCollection.find().toArray();

        return res.status(200).json({
          success: true,
          data: sites,
        });
      }

      case "POST": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate
        const existing = await siteCollection.findOne({ name: trimmedName });
        if (existing) {
          return res.status(409).json({ success: false, message: "Site name already exists." });
        }

        const insertResult = await siteCollection.insertOne({ name: trimmedName });

        return res.status(201).json({
          success: true,
          message: "Site created successfully",
          data: { _id: insertResult.insertedId, name: trimmedName },
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Site index API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

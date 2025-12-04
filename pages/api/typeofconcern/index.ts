import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const typeofConcern = db.collection("typeofconcern");

    // =========================
    // 📌 GET — Fetch all Types
    // =========================
    if (req.method === "GET") {
      try {
        const allConcernTypes = await typeofConcern
          .find()
          .sort({ name: 1 })
          .toArray();

        return res.status(200).json({
          success: true,
          data: allConcernTypes,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch Type of Concern list.",
        });
      }
    }

    // =========================
    // 📌 POST — Create New Type
    // =========================
    if (req.method === "POST") {
      try {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Type of Concern name is required.",
          });
        }

        const trimmedName = name.trim();

        // Check duplicate
        const existing = await typeofConcern.findOne({ name: trimmedName });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Type of Concern already exists.",
          });
        }

        const insertResult = await typeofConcern.insertOne({
          name: trimmedName,
          createdAt: new Date(),
        });

        return res.status(201).json({
          success: true,
          data: insertResult,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error creating Type of Concern.",
        });
      }
    }

    // =========================
    // ❌ Method Not Allowed
    // =========================
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database connection error",
    });
  }
}

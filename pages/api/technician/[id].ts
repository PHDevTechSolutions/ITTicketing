import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Technician ID" });
    }

    const db = await connectToDatabase();
    const technicianCollection = db.collection("technician"); // assuming collection name is 'site'
    const technicianId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const technician = await technicianCollection.findOne({ _id: technicianId });
        if (!technician) {
          return res.status(404).json({ success: false, message: "Technician not found" });
        }
        return res.status(200).json({ success: true, data: technician });
      }

      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate excluding current
        const existing = await technicianCollection.findOne({
          name: trimmedName,
          _id: { $ne: technicianId },
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Technician name already exists." });
        }

        const updated = await technicianCollection.findOneAndUpdate(
          { _id: technicianId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );

        if (!updated) {
          return res.status(500).json({ success: false, message: "Update failed." });
        }

        return res.status(200).json({
          success: true,
          message: "technician updated successfully.",
          data: updated.value || { _id: technicianId, name: trimmedName },
        });
      }

      case "DELETE": {
        const deleted = await technicianCollection.deleteOne({ _id: technicianId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Technician not found" });
        }
        return res.status(200).json({ success: true, message: "Technician deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Technician API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Type of Concern ID" });
    }

    const db = await connectToDatabase();
    const typeofConcernCollection = db.collection("typeofconcern");
    const concernId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const concern = await typeofConcernCollection.findOne({ _id: concernId });
        if (!concern) {
          return res.status(404).json({ success: false, message: "Type of Concern not found" });
        }
        return res.status(200).json({ success: true, data: concern });
      }

      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check if another concern already has this name
        const existing = await typeofConcernCollection.findOne({
          name: trimmedName,
          _id: { $ne: concernId }, // exclude current concern
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Type of Concern name already exists." });
        }

        const updated = await typeofConcernCollection.findOneAndUpdate(
          { _id: concernId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );

        // ✅ Check for null before accessing .value
        if (!updated) {
          return res.status(500).json({ success: false, message: "Update failed." });
        }

        // If updated.value is null, document exists but no change was made
        return res.status(200).json({
          success: true,
          message: "Type of Concern updated successfully.",
          data: updated.value || { _id: concernId, name: trimmedName },
        });
      }

      case "DELETE": {
        const deleted = await typeofConcernCollection.deleteOne({ _id: concernId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Type of Concern not found" });
        }
        return res.status(200).json({ success: true, message: "Type of Concern deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Type of Concern API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

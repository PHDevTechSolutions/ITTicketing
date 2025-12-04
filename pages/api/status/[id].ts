import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Status ID" });
    }

    const db = await connectToDatabase();
    const statusCollection = db.collection("status"); // assuming collection name is 'site'
    const statusId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const status = await statusCollection.findOne({ _id: statusId });
        if (!status) {
          return res.status(404).json({ success: false, message: "Status not found" });
        }
        return res.status(200).json({ success: true, data: status });
      }

      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate excluding current
        const existing = await statusCollection.findOne({
          name: trimmedName,
          _id: { $ne: statusId },
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Status name already exists." });
        }

        const updated = await statusCollection.findOneAndUpdate(
          { _id: statusId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );

        if (!updated) {
          return res.status(500).json({ success: false, message: "Update failed." });
        }

        return res.status(200).json({
          success: true,
          message: "Status updated successfully.",
          data: updated.value || { _id: statusId, name: trimmedName },
        });
      }

      case "DELETE": {
        const deleted = await statusCollection.deleteOne({ _id: statusId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Status not found" });
        }
        return res.status(200).json({ success: true, message: "Status deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Status API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

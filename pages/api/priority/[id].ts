import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Priority ID" });
    }

    const db = await connectToDatabase();
    const priorityCollection = db.collection("priority"); // Assuming collection name is 'priority'
    const priorityId = new ObjectId(id as string);

    switch (req.method) {
      // ======================
      // GET — Single Priority
      // ======================
      case "GET": {
        const priority = await priorityCollection.findOne({ _id: priorityId });
        if (!priority) {
          return res.status(404).json({ success: false, message: "Priority not found" });
        }
        return res.status(200).json({ success: true, data: priority });
      }

      // ======================
      // PUT — Update Priority
      // ======================
      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate excluding itself
        const existing = await priorityCollection.findOne({
          name: trimmedName,
          _id: { $ne: priorityId },
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Priority name already exists." });
        }

        const updated = await priorityCollection.findOneAndUpdate(
          { _id: priorityId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );

        // If update failed
        if (!updated) {
          return res.status(500).json({ success: false, message: "Update failed." });
        }

        return res.status(200).json({
          success: true,
          message: "Priority updated successfully.",
          data: updated.value || { _id: priorityId, name: trimmedName },
        });
      }

      // ======================
      // DELETE — Remove Priority
      // ======================
      case "DELETE": {
        const deleted = await priorityCollection.deleteOne({ _id: priorityId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Priority not found" });
        }
        return res.status(200).json({ success: true, message: "Priority deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Priority API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

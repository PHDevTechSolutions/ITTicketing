import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Group ID" });
    }

    const db = await connectToDatabase();
    const groupCollection = db.collection("group"); // assuming collection name is 'groups'
    const groupId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const group = await groupCollection.findOne({ _id: groupId });
        if (!group) {
          return res.status(404).json({ success: false, message: "Group not found" });
        }
        return res.status(200).json({ success: true, data: group });
      }

      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate excluding current
        const existing = await groupCollection.findOne({
          name: trimmedName,
          _id: { $ne: groupId },
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Group name already exists." });
        }

        const updated = await groupCollection.findOneAndUpdate(
          { _id: groupId },
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
          message: "Group updated successfully.",
          data: updated.value || { _id: groupId, name: trimmedName },
        });
      }

      case "DELETE": {
        const deleted = await groupCollection.deleteOne({ _id: groupId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Group not found" });
        }
        return res.status(200).json({ success: true, message: "Group deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Group API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

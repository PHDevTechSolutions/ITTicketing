import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Site ID" });
    }

    const db = await connectToDatabase();
    const siteCollection = db.collection("site"); // assuming collection name is 'site'
    const siteId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const site = await siteCollection.findOne({ _id: siteId });
        if (!site) {
          return res.status(404).json({ success: false, message: "Site not found" });
        }
        return res.status(200).json({ success: true, data: site });
      }

      case "PUT": {
        const { name } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // Check duplicate excluding current
        const existing = await siteCollection.findOne({
          name: trimmedName,
          _id: { $ne: siteId },
        });

        if (existing) {
          return res.status(409).json({ success: false, message: "Site name already exists." });
        }

        const updated = await siteCollection.findOneAndUpdate(
          { _id: siteId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );

        if (!updated) {
          return res.status(500).json({ success: false, message: "Update failed." });
        }

        return res.status(200).json({
          success: true,
          message: "Site updated successfully.",
          data: updated.value || { _id: siteId, name: trimmedName },
        });
      }

      case "DELETE": {
        const deleted = await siteCollection.deleteOne({ _id: siteId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Site not found" });
        }
        return res.status(200).json({ success: true, message: "Site deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Site API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

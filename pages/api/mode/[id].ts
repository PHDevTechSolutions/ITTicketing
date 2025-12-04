import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid Mode ID" });
    }

    const db = await connectToDatabase();
    const modes = db.collection("mode");
    const modeId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const mode = await modes.findOne({ _id: modeId });
        if (!mode) {
          return res.status(404).json({ success: false, message: "Mode not found" });
        }
        return res.status(200).json({ success: true, data: mode });
      }

case "PUT": {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  const trimmedName = name.trim();

  // Check if another mode already has this name
  const existing = await modes.findOne({
    name: trimmedName,
    _id: { $ne: modeId }, // exclude current mode
  });

  if (existing) {
    return res.status(409).json({ success: false, message: "Mode name already exists." });
  }

  const updated = await modes.findOneAndUpdate(
    { _id: modeId },
    { $set: { name: trimmedName } },
    { returnDocument: "after" }
  );

  // ✅ Check for null before accessing .value
if (!updated) {
  return res.status(500).json({ success: false, message: "Update failed." });
}

// If updated.value is null, it means no change was made, but the document exists
return res.status(200).json({
  success: true,
  message: "Mode updated successfully.",
  data: updated.value || { _id: modeId, name: trimmedName },
});
}

      case "DELETE": {
        const deleted = await modes.deleteOne({ _id: modeId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Mode not found" });
        }
        return res.status(200).json({ success: true, message: "Mode deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Mode API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

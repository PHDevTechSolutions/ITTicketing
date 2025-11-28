import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, message: "Invalid department ID" });
    }

    const db = await connectToDatabase();
    const departments = db.collection("department");
    const deptId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        const department = await departments.findOne({ _id: deptId });
        if (!department) {
          return res.status(404).json({ success: false, message: "Department not found" });
        }
        return res.status(200).json({ success: true, data: department });
      }

case "PUT": {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  const trimmedName = name.trim();

  // ❌ Check if another department already has this name
  const existing = await departments.findOne({ 
    name: trimmedName, 
    _id: { $ne: deptId } // exclude current department
  });
  if (existing) {
    return res.status(409).json({ success: false, message: "Department name already exists." });
  }

  const updated = await departments.findOneAndUpdate(
    { _id: deptId },
    { $set: { name: trimmedName } },
    { returnDocument: "after" }
  );
 
  return res.status(200).json({ success: true});
}


      case "DELETE": {
        const deleted = await departments.deleteOne({ _id: deptId });
        if (deleted.deletedCount === 0) {
          return res.status(404).json({ success: false, message: "Department not found" });
        }
        return res.status(200).json({ success: true, message: "Department deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Department API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

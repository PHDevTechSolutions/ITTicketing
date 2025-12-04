import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  const departments = db.collection("department");

  if (req.method === "GET") {
    try {
      const allDepartments = await departments.find().sort({ name: 1 }).toArray();
      res.status(200).json({ success: true, data: allDepartments });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch departments." });
    }
  }

  else if (req.method === "POST") {
    try {
      const { name } = req.body;
      if (!name)
        return res.status(400).json({ success: false, message: "Department name is required." });

      const existing = await departments.findOne({ name });
      if (existing)
        return res.status(409).json({ success: false, message: "Department already exists." });

      const newDept = await departments.insertOne({
        name,
        createdAt: new Date(),
      });

      res.status(201).json({ success: true, data: newDept });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error creating department." });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  
  // 🎯 PAGBABAGO 1: I-reference ang 'requesttype' collection
  const requestTypes = db.collection("requesttype"); 

  if (req.method === "GET") {
    try {
      // 🎯 PAGBABAGO 2: I-fetch ang lahat ng Request Types
      const allRequestTypes = await requestTypes.find().sort({ name: 1 }).toArray();
      res.status(200).json({ success: true, data: allRequestTypes });
    } catch (error) {
      // 📝 Binago ang mensahe
      res.status(500).json({ success: false, message: "Failed to fetch request types." });
    }
  }

  else if (req.method === "POST") {
    try {
      const { name } = req.body;
      if (!name)
        // 📝 Binago ang mensahe
        return res.status(400).json({ success: false, message: "Request Type name is required." });

      // 🎯 PAGBABAGO 3: I-check ang 'requestTypes' collection para sa existing name
      const existing = await requestTypes.findOne({ name });
      if (existing)
        // 📝 Binago ang mensahe
        return res.status(409).json({ success: false, message: "Request Type name already exists." });

      // 🎯 PAGBABAGO 4: I-insert sa 'requestTypes' collection
      const newRequestType = await requestTypes.insertOne({
        name,
        createdAt: new Date(),
      });

      res.status(201).json({ success: true, data: newRequestType });
    } catch (error) {
      // 📝 Binago ang mensahe
      res.status(500).json({ success: false, message: "Error creating request type." });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
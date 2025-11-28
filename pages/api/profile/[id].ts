// pages/api/profile/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
// Removed: import { ObjectId } from "mongodb"; (No longer needed for query)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const db = await connectToDatabase();
  const users = db.collection("users");
  const { id } = req.query; // 'id' now contains the Username string from the URL

  // 1. Validate 'id' (now Username string)
  if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, message: "Invalid username provided." });
  }
  const usernameString = id as string;

  try {
    // 2. Query MongoDB using the Username
    const user = await users.findOne({ Username: usernameString }); // <--- CRITICAL CHANGE

    // 3. Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    // 4. MASK SENSITIVE DATA
    const { Password, ...userWithoutPassword } = user;

    // 5. Success Response
    res.status(200).json({ success: true, data: userWithoutPassword });

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Error fetching profile." });
  }
}
// pages/api/profile/[refID].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const db = await connectToDatabase();
    const users = db.collection("users");

    const { refID } = req.query;

    if (!refID || Array.isArray(refID)) {
      return res.status(400).json({ success: false, message: "Invalid reference ID." });
    }

    const idString = decodeURIComponent(refID as string).trim();

    const user = await users.findOne({ ReferenceID: idString });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { Password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: safeUser
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

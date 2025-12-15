// pages/api/user/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: referenceId } = req.query; // 'id' galing sa URL /api/user/[id]

  if (!referenceId || typeof referenceId !== "string") {
    return res.status(400).json({ success: false, message: "ReferenceID missing or invalid" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { password, avatar } = req.body;

    if (!password && !avatar) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const updateData: any = {};
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.Password = hashedPassword; // field sa MongoDB mo
    }
    if (avatar) {
      updateData.ProfilePic = avatar;
    }

    const db = await connectToDatabase();
    const result = await db.collection("users").updateOne(
      { ReferenceID: referenceId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

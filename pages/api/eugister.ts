
import { NextApiRequest, NextApiResponse } from "next";
import { registerUser } from "@/lib/mongodb"; // MongoDB helper

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { Username, Email, Password, Firstname, Lastname, Department, ReferenceID } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
const result = await registerUser({
  Username,
  Email,
  Password,
  Role: "enduser", // default role
  Firstname,
  Lastname,
  Department,
  ReferenceID,
});

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
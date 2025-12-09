import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { connectToDatabase, validateUser } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find user by email (case-insensitive)
    const user = await usersCollection.findOne({ Email: { $regex: `^${Email}$`, $options: "i" } });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Only IT Department can login
    if (user.Department !== "IT") {
      return res.status(403).json({ success: false, message: "Access denied. Only IT accounts allowed." });
    }

    // Validate credentials (make sure validateUser returns the user object)
    const result = await validateUser({ Email, Password });
    if (!result.success || !result.user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const userId = result.user._id.toString();
    const refID = result.user.ReferenceID; // ✅ This must exist

    if (!refID) {
      return res.status(500).json({ success: false, message: "User has no ReferenceID." });
    }

    // Set HTTP-only session cookie
    res.setHeader(
      "Set-Cookie",
      serialize("session", userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })
    );

    // Return ReferenceID and other info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      ReferenceID: refID, // <- store this in localStorage
      Firstname: user.Firstname,
      Lastname: user.Lastname,
      Username: user.Username,
      Email: user.Email,
      Role: user.Role,
      Department: user.Department,
      createdAt: user.createdAt,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

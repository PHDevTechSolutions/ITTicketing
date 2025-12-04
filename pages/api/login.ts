// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { validateUser } from "@/lib/mongodb"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ message: "Username and Password are required." });
  }

  try {
    const result = await validateUser({ Username, Password });

    if (!result.success || !result.user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userId = result.user._id.toString(); // Still use the ID for the secure cookie

    // Set session cookie (for secure session tracking)
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

    // 5. Success Response
    // CRITICAL CHANGE: Return the Username for the frontend to use in localStorage
    return res.status(200).json({ 
      success: true, 
      message: "Login successful.", 
      Username: result.user.Username, // <--- RETURNED USERNAME
      role: result.user.Role
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
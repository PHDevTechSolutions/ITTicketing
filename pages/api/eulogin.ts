// pages/api/eulogin.ts
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { validateEndUser } from "@/lib/mongodb"; 
import { ObjectId } from "mongodb";

// Define the EndUser type to match what's returned from validateEndUser
interface EndUser {
  _id: ObjectId;
  Username: string;
  Email: string;
  Department: string;
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  Role?: string;
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false, 
      error: "Method not allowed" 
    });
  }

  const { Username, Password } = req.body;

  if (!Username || !Password) {
    return res.status(400).json({ 
      success: false, 
      error: "Username and Password are required." 
    });
  }

  try {
    const result = await validateEndUser({ Username, Password });

    if (!result.success || !result.user) {
      // Log failed attempt for security monitoring
      console.warn(`Failed login attempt for username: ${Username}`);
      
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials." // Changed to 'error' for toast consistency
      });
    }

    // Type assertion to tell TypeScript what user looks like
    const user = result.user as EndUser;
    const userId = user._id.toString();

    // Set secure session cookie
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

    // Success response
    return res.status(200).json({ 
      success: true, 
      message: "Login successful.", 
      Username: user.Username,
      role: user.Role || "enduser" // Fallback if Role is undefined
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
}
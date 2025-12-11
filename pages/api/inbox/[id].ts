import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { concernNumber } = req.query;

  if (!concernNumber || typeof concernNumber !== "string") {
    return res.status(400).json({ success: false, message: "Invalid ConcernNumber" });
  }

  const db = await connectToDatabase();
  const inboxCollection = db.collection("inbox");

  if (req.method === "PATCH") {
    try {
const result = await inboxCollection.updateOne(
  { ConcernNumber: concernNumber },
  { $set: { readstatus: "Read" } }
);

      if (result.modifiedCount === 1) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(404).json({ success: false, message: "Inbox item not found" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/inbox/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

// Interface para sa Inbox document
interface InboxItem {
  ConcernNumber: string;
  remarks: string;
  readstatus: "Unread", // <- important!
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const inboxCollection = db.collection<InboxItem>("inbox");

    switch (req.method) {
      case "GET": {
        // Kumuha ng lahat ng inbox items, latest first
        const inboxItems = await inboxCollection.find({}).sort({ _id: -1 }).toArray();

        // Siguraduhin na lahat may readstatus at createdAt (para sa legacy data)
        const formattedItems = inboxItems.map(item => ({
          ...item,
          readstatus: item.readstatus || "Unread",
          createdAt: item.createdAt || new Date(),
        }));

        return res.status(200).json({ success: true, data: formattedItems });
      }

      case "POST": {
        const { ConcernNumber, remarks } = req.body;

        // Validate input
        if (!ConcernNumber || typeof ConcernNumber !== "string" || !ConcernNumber.trim()) {
          return res.status(400).json({ success: false, message: "ConcernNumber is required." });
        }

        if (!remarks || typeof remarks !== "string" || !remarks.trim()) {
          return res.status(400).json({ success: false, message: "Remarks are required." });
        }

        const newItem: InboxItem = {
          ConcernNumber: ConcernNumber.trim(),
          remarks: remarks.trim(),
          readstatus: "Unread", // default kapag bagong inbox item
          createdAt: new Date(),
        };

        const result = await inboxCollection.insertOne(newItem);

        if (!result.acknowledged) {
          return res.status(500).json({ success: false, message: "Failed to create inbox item." });
        }

        return res.status(201).json({
          success: true,
          message: "Inbox item created successfully.",
          data: newItem,
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Inbox API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

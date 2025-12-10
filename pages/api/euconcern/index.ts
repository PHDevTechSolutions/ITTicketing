import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { InsertOneResult, Db } from "mongodb";

interface IncomingConcernData {
  Fullname: string;
  department: string;
  Email:string;
  dateSched: string;
  type: string;
  remarks: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  requesttype: string;
  mode: string;
  site: string;
  reqt: string;
  ConcernNumber?: string;
  id?: string;
  readstatus: string;
  createdAt?: string; // stored as ISO string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let db: Db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(503).json({
      success: false,
      message: "Service Unavailable: Failed to connect to database.",
    });
  }

  const ConcernsCollection = db.collection<IncomingConcernData>("concerns");

  if (req.method === "GET") {
    try {
      const concerns = await ConcernsCollection.find({}).sort({ createdAt: -1 }).toArray();

      const formattedConcerns = concerns.map((c) => ({
        id: c.ConcernNumber || c._id.toHexString(),
        employeeName: c.Fullname,
        department: c.department,
        type: c.type,
        reqt: c.requesttype,
        remarks: c.remarks,
        Email: c.Email,
        site: c.site,
        createdAt: c.createdAt ?? new Date().toISOString(),
        priority: c.priority,
        readstatus: c.readstatus,
        ConcernNumber: c.ConcernNumber,
        status: "Pending", // default
      }));

      return res.status(200).json({
        success: true,
        data: formattedConcerns,
        message: "Concerns fetched successfully.",
      });
    } catch (error) {
      console.error("Concern fetching failed:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during fetching.",
      });
    }
  } else if (req.method === "POST") {
    try {
      const ConcernData: IncomingConcernData = req.body;

      if (!ConcernData.Fullname || !ConcernData.department || !ConcernData.requesttype || !ConcernData.remarks) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: Fullname, department, request type, and remarks.",
        });
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const today = `${year}-${month}-${day}`;

      const todaysCount = await ConcernsCollection.countDocuments({
        createdAt: { $regex: `^${today}` }, // match today's date
      });

      const formattedConcernNumber = `TKC-${today}-${todaysCount + 1}`;

      const newConcern: IncomingConcernData = {
        ...ConcernData,
        ConcernNumber: formattedConcernNumber,
        createdAt: new Date().toISOString(),
      };

      const result: InsertOneResult = await ConcernsCollection.insertOne(newConcern);

      if (result.acknowledged) {
        return res.status(201).json({
          success: true,
          message: `Concern ${formattedConcernNumber} created successfully.`,
          ConcernNumber: formattedConcernNumber,
          insertedId: result.insertedId,
        });
      } else {
        throw new Error("Database insertion failed.");
      }
    } catch (error) {
      console.error("Concern creation failed:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during creation.",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uri = process.env.MONGODB_URI!;

  try {
    // Reuse connection (para hindi ma-spam connection sa Next.js)
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const db = client.db("ITticketing"); // ← palitan ng totoong DB name
    const collection = db.collection("concerns"); // ← collection name mo

if (req.method === "GET") {
      const mails = await collection.find({}).sort({ _id: -1 }).toArray();
      // --- GINAWANG BAGONG RESPONSE FORMAT ---
      return res.status(200).json({
        success: true, 
        data: mails 
      });
    }

    return res.status(405).json({ message: "Method Not Allowed" });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

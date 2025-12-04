import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      // 📝 Binago ang mensahe para maging 'Request Type'
      return res.status(400).json({ success: false, message: "Invalid Request Type ID" });
    }

    const db = await connectToDatabase();
    
    // 🎯 PAGBABAGO 1: I-reference ang 'requesttype' collection
    const requesttypeCollection = db.collection("requesttype"); 
    
    // 🎯 PAGBABAGO 2: Binago ang variable name mula deptId patungong requestTypeId
    const requestTypeId = new ObjectId(id as string);

    switch (req.method) {
      case "GET": {
        // 🎯 PAGBABAGO 3: Gamitin ang requesttypeCollection at requestTypeId
        const requestType = await requesttypeCollection.findOne({ _id: requestTypeId });
        
        if (!requestType) {
          // 📝 Binago ang mensahe para maging 'Request Type'
          return res.status(404).json({ success: false, message: "Request Type not found" });
        }
        return res.status(200).json({ success: true, data: requestType });
      }

      case "PUT": {
        const { name } = req.body;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, message: "Name is required" });
        }

        const trimmedName = name.trim();

        // 🎯 PAGBABAGO 4: I-check sa requesttypeCollection, i-exclude ang kasalukuyang ID
        const existing = await requesttypeCollection.findOne({ 
          name: trimmedName, 
          _id: { $ne: requestTypeId } // exclude current document
        });
        
        if (existing) {
          // 📝 Binago ang mensahe para maging 'Request Type'
          return res.status(409).json({ success: false, message: "Request Type name already exists." });
        }

        // 🎯 PAGBABAGO 5: I-update ang requesttypeCollection
        const updated = await requesttypeCollection.findOneAndUpdate(
          { _id: requestTypeId },
          { $set: { name: trimmedName } },
          { returnDocument: "after" }
        );
        
        // Maaari mo ring i-return ang updated document kung gusto mo:
        // return res.status(200).json({ success: true, data: updated.value });
        return res.status(200).json({ success: true, message: "Request Type updated."});
      }


      case "DELETE": {
        // 🎯 PAGBABAGO 6: I-delete sa requesttypeCollection
        const deleted = await requesttypeCollection.deleteOne({ _id: requestTypeId });
        
        if (deleted.deletedCount === 0) {
          // 📝 Binago ang mensahe para maging 'Request Type'
          return res.status(404).json({ success: false, message: "Request Type not found" });
        }
        // 📝 Binago ang mensahe para maging 'Request Type'
        return res.status(200).json({ success: true, message: "Request Type deleted." });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("Request Type API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
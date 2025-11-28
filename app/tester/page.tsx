import { connectToDatabase } from "@/lib/mongodb";

export default async function TesterPage() {
  let accounts = [];
  let message = "";

  try {
    const db = await connectToDatabase();
    message = "✅ Fetched accounts collection!";
  } catch (err) {
    console.error("❌ Failed to fetch accounts:", err);
    message = "❌ Failed to fetch accounts!";
  }
}

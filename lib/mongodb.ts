import { MongoClient, Db } from "mongodb";
import bcrypt from "bcrypt";

// Extend the global object type for TypeScript
declare global {
    var _mongoClient: MongoClient | undefined;
}

if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not defined");

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// --- MongoDB Client Connection Logic (For Next.js API Routes) ---

if (process.env.NODE_ENV === "development") {
    // Sa Development, ginagamit ang global variable para maiwasan ang multiple client connections
    if (!global._mongoClient) {
        client = new MongoClient(uri);
        global._mongoClient = client;
    } else {
        client = global._mongoClient;
    }
    clientPromise = client.connect();
} else {
    // Sa Production, gumawa lang ng bagong client
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

// Default export: ang promise na ito ang ginagamit ng NextAuth, etc.
export default clientPromise;

/**
 * Nagbabalik ng koneksyon sa 'ITticketing' database.
 */
export async function connectToDatabase(): Promise<Db> {
    const client = await clientPromise;
    return client.db("ITticketing");
}

// --- Auto-Increment Logic ---

interface Counter {
    _id: string;
    sequence_value: number;
}

/**
 * Fetches and increments the sequence value for auto-numbering.
 * Gagamitin ito para sa pag-generate ng sequential IDs (e.g., Ticket numbers).
 * @param sequenceName Ang _id ng counter document (e.g., "ticketNumber").
 * @returns The pure sequential number as a string.
 */
export async function getNextSequenceValue(sequenceName: string): Promise<string> {
    
    const db = await connectToDatabase(); 
    
    const countersCollection = db.collection<Counter>("counters"); 

    // Find the counter and atomically increment its value
    const updateResult = await countersCollection.findOneAndUpdate(
        { _id: sequenceName },
        { $inc: { sequence_value: 1 } },
        { 
            returnDocument: 'after', 
            upsert: true // Mag-i-start sa 1 kung wala pa.
        } 
    );
    
    // Check if the update was successful and value is present
    const nextId = updateResult?.sequence_value;

    if (nextId === undefined || nextId === null) {
        throw new Error(`Failed to retrieve sequence value for ${sequenceName}`);
    }

    // Ibalik ang numero bilang string (e.g., "1")
    return nextId.toString(); 
}


export async function registerUser({
    Username,
    Email,
    Password,
    Role,
    Firstname,
    Lastname,
    ReferenceID,
}: {
    Username: string;
    Email: string;
    Password: string;
    Role: string;
    Firstname: string;
    Lastname: string;
    ReferenceID: string;
}) {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users"); // Para sa System Users

    // Prevent duplicate username or email
    const existing = await usersCollection.findOne({ $or: [{ Username }, { Email }] });
    if (existing) return { success: false, message: "Username or Email already exists" };

    const hashedPassword = await bcrypt.hash(Password, 10);

    await usersCollection.insertOne({
        Username,
        Email,
        Password: hashedPassword,
        Role,
        Firstname,
        Lastname,
        ReferenceID,
        createdAt: new Date(),
    });

    return { success: true };
}

export async function validateUser({
    Username,
    Password,
}: {
    Username: string;
    Password: string;
}) {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ Username });
    if (!user) return { success: false, message: "Invalid username or password" };

    const isValid = await bcrypt.compare(Password, user.Password); 
    if (!isValid) return { success: false, message: "Invalid username or password" };

    return { success: true, user };
}

// --- End User Registration and Validation ---

export async function euregisterUser({
    Username,
    Email,
    Password,
    Department, // Iba't ibang field kumpara sa System User
    Firstname,
    Lastname,
    ReferenceID,
}: {
    Username: string;
    Email: string;
    Password: string;
    Department: string;
    Firstname: string;
    Lastname: string;
    ReferenceID: string;
}) {
    const db = await connectToDatabase();
    const endusersCollection = db.collection("endusers"); // Para sa End Users

    // Prevent duplicate username or email
    const existing = await endusersCollection.findOne({ $or: [{ Username }, { Email }] });
    if (existing) return { success: false, message: "Username or Email already exists" };

    const hashedPassword = await bcrypt.hash(Password, 10);

    await endusersCollection.insertOne({
        Username,
        Email,
        Password: hashedPassword,
        Department,
        Firstname,
        Lastname,
        ReferenceID,
        createdAt: new Date(),
    });

    return { success: true };
}

export async function validateEndUser({
    Username,
    Password,
}: {
    Username: string;
    Password: string;
}) {
    const db = await connectToDatabase();
    const endusersCollection = db.collection("endusers");

    const user = await endusersCollection.findOne({ Username });
    if (!user) return { success: false, message: "Invalid username or password" };

    const isValid = await bcrypt.compare(Password, user.Password); 
    if (!isValid) return { success: false, message: "Invalid username or password" };

    return { success: true, user };
}
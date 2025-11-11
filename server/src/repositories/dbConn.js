import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();  // Loads environment variables from .env

export let client;

export async function connectDB() {
    if (client && client.topology?.isConnected()) return client;

    const connectionString = process.env.DB_CONN_STR || "mongodb://localhost:27017/testdb";
    client = new MongoClient(connectionString);
    await client.connect();
    console.log("MongoDB connected");
    return client;
}

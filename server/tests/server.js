import express from "express"
const app = express()
const PORT = 3000

app.use(express.json())

// Routes
app.get("/", (req, res) => {
    res.send("Hello from Node.js!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

import { MongoClient, ServerApiVersion } from "mongodb";

import dotenv from "dotenv";

dotenv.config();  // Loads environment variables from .env

const uri = process.env.DB_CONN_STR;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
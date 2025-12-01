import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './repositories/dbConn.js';
import { Cleanup } from './utils/cleanup.js'

dotenv.config();

const PORT = 3000;

(async () => {
    try {
        console.log(">>> DB URI:", process.env.DB_CONN_STR);
        // Conn to MongoDB 
        await connectDB()

        // Ensure TTL index exists
        await Cleanup.ensureChatTTL()

        // Start the background cleanup job
        Cleanup.startCleanupJobOfExpiredChatsFromUsers()

        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        });

    } catch (err) {
        console.error("Failed to start server:", err)
        process.exit(1)
    }
})();
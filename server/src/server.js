import app from './app.js';
import { connectDB } from './repositories/dbConn.js';
import { Cleanup } from './utils/cleanup.js'

const PORT = 3000;

(async () => {
    try {
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
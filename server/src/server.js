import app from './app.js';
import { connectDB } from './repositories/dbConn.js';

const PORT = 3000;

(async () => {
    try {
        await connectDB(); // ensure DB is connected before listening
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
})();
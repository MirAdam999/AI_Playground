import { Limits } from "./limits.js";
import cron from "node-cron";
import { ChatRepo } from '../repositories/chatRepo.js'
import { UserRepo } from '../repositories/userRepo.js'

export class Cleanup {

    // Ensure TTL index using ChatRepo: TTL deletes chats after 30 days
    static async ensureChatTTL() {
        const days = Limits.daysConvosStored;

        // Get the collection from ChatRepo
        const collection = await ChatRepo.accessCollection();
        await collection.createIndex(
            { createdAt: 1 },
            { expireAfterSeconds: days * 24 * 60 * 60 }
        );

        console.log("[TTL] Chat TTL index ensured");
    }

    // Run daily cron job to remove 'orphan' chat references from users
    static async startCleanupJobOfExpiredChatsFromUsers() {
        cron.schedule("0 3 * * *", async () => {
            try {
                console.log("[Cleanup] Starting 'orphan' chat cleanup via repos...");

                const users = await UserRepo.getAllObj();
                const chats = await ChatRepo.getAllObj();
                const validChatIDs = new Set(chats.map(c => c._id));

                for (const user of users) {
                    const originalCount = user.chats?.length || 0;
                    if (!user.chats?.length) continue;

                    user.chats = user.chats.filter(c => validChatIDs.has(c.id));

                    if (user.chats.length !== originalCount) {
                        await UserRepo.updateObj(user._id, { chats: user.chats });
                        console.log(`[Cleanup] Updated user ${user._id}, removed orphan chats`);
                    }
                }

                console.log("[Cleanup] Orphan chat cleanup done!");
            } catch (err) {
                console.error("[Cleanup] Error:", err);
            }
        });
    }
}
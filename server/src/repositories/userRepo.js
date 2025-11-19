import { BaseRepo } from "./baseRepo.js";
import { ObjectId } from "mongodb";

export class UserRepo extends BaseRepo {
    static collectionName = 'User';

    /**
    * Adds a chat reference (id + title) to user's chat history
    * @param {string} userId 
    * @param {{ id: string, title: string }} chatData 
    * @returns {boolean}
    */
    static async addChatToHistory(userId, chatData) {
        let output;
        try {
            const collection = await this.accessCollection();
            const formattedChat = {
                id: new ObjectId(chatData.id),
                title: chatData.title,
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(userId) },
                { $push: { chats: formattedChat } }
            )

            output = result.modifiedCount > 0 ? true : false
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] addChatToHistory(${userId}, ${JSON.stringify(chatData)}) ->`, output)
        }
    }
}
import { BaseRepo } from "./baseRepo";
import { ObjectId } from "mongodb";

export class ChatRepo extends BaseRepo {
    static collectionName = 'Chat';

    /**
     * Adds a message to a chat's messages array
     * @param {string} chatId 
     * @param {{ message: string, role: string}} messageData 
     * @returns {boolean} 
     */
    static async addMessage(chatId, messageData) {
        let output
        try {
            const collection = await this.accessCollection();
            const messageWithTimestamp = {
                ...messageData,
                datetime: new Date(),
            }

            const result = await collection.updateOne(
                { _id: new ObjectId(chatId) },
                { $push: { messages: messageWithTimestamp } }
            )

            output = result.modifiedCount > 0
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] addMessage(${chatId}, ${JSON.stringify(messageData)}) ->`, output)
        }
    }

    /**
     * retrieve all messages for a chat
     * @param {string} chatId 
     * @returns {Array[JSON]|false|null}
     */
    static async getMessages(chatId) {
        let output;
        try {
            const collection = await this.accessCollection();
            const chat = await collection.findOne({ _id: new ObjectId(chatId) }, { projection: { messages: 1 } })
            output = chat?.messages || null
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`[${this.name}] getMessages(${chatId}) ->`, output)
        }
    }
}
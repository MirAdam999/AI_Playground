import { BaseRepo } from "./baseRepo";
import { ObjectId } from "mongodb";

export class ChatRepo extends BaseRepo {
    static collectionName = 'Chat';

    /**
     * Adds a message to a chat's messages array
     * @param {string} chatId 
     * @param {string} userMsg
     * @param {string} katanemoResponse
     * @param {string} smolResponse
     * @returns {boolean} 
     */
    static async addMessage(chatId, userMsg, katanemoResponse, smolResponse) {
        let output
        try {
            const collection = await this.accessCollection();
            const result = await collection.updateOne(
                { _id: new ObjectId(chatId) },
                {
                    $push: {
                        messages_katanemo_model: { 'role': 'user', 'content': userMsg },
                        messages_katanemo_model: { 'role': 'assistant', 'content': katanemoResponse },
                        messages_smol_model: { 'role': 'user', 'content': userMsg },
                        messages_smol_model: { 'role': 'assistant', 'content': smolResponse }
                    }
                }
            );

            output = result.modifiedCount > 0
            return output
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(
                `[${this.name}] addMessage(${chatId},
                user=${JSON.stringify(userMsg)}, 
                katanemo=${JSON.stringify(katanemoResponse)}, 
                smol=${JSON.stringify(smolResponse)}) ->`,
                output
            );
        }
    }

}
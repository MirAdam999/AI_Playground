import { BaseRepo } from "./baseRepo.js";
import { ObjectId } from "mongodb";
import { Limits } from "../utils/limits.js";

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
                        messages_katanemo_model: {
                            $each: [
                                { role: "user", content: userMsg },
                                { role: "assistant", content: katanemoResponse }
                            ], $slice: -Limits.msgsInConvoMax // convos up to x msg long 
                        },
                        messages_smol_model: {
                            $each: [
                                { role: "user", content: userMsg },
                                { role: "assistant", content: smolResponse }
                            ], $slice: -Limits.msgsInConvoMax // convos up to x msg long 
                        }
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
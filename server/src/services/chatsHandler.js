import { ObjectId } from "mongodb";
import { ChatRepo } from '../repositories/chatRepo'
import { UserRepo } from "../repositories/userRepo";
import { Authenticator } from "./authenticator";

export class ChatsHandler {
    // bind to chat history (including: gen summary for the chat)
    // send msg

    /**
    * Fetches all convo by chatID
    * @param {string} token 
    * @param {number} chatID 
    * @returns {[ (string | false), number ]} [token | false, statusCode]
    */
    static async fetchChat(token, chatID) {
        let output = false
        try {
            const user = Authenticator.auth(token)
            if (!user || !user.userID) return [false, 400]

            const userChatHistory = UserRepo.getObjByID(user.userID)
            if (!userChatHistory) return [false, 500]

            const confirmOwnership = userChatHistory.chats.some(c => c.id.equals(new ObjectId(chatID)))
            if (!confirmOwnership) return [false, 401]

            const chat = ChatRepo.getObjByID(chatID)
            if (!chat) return [false, 500]

            output = `fetched`
            return [chat, 200]
        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`ChatsHandler:fetchChat(${chatID}) -> `, output)
        }
    }
}
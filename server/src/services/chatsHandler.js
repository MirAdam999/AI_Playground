import { ObjectId } from "mongodb";
import { ChatRepo } from '../repositories/chatRepo'
import { Authenticator } from "./authenticator";

export class ChatsHandler {
    // fetch chat
    // bind to chat history (including: gen summary for the chat)
    // send msg

    static async fetchChat(token, chatID) {
        let output = false
        try {
            const user = Authenticator.auth(token)
            if (!user || !user.userID) return false

            const userChatHistory = ChatsHistoryRepo.getObjByFIlters({ 'user': new ObjectId(user.userID) })
            if (!userChatHistory) return false

            const confirmOwnership = userChatHistory.chats.some(c => c.id.equals(chatID))
            if (!confirmOwnership) return false

            const chat = ChatRepo.getObjByID(chatID)
            if (!chat) return false

            output = `fetched`
            return chat
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`ChatsHandler:fetchChat(${chatID}) -> `, output)
        }
    }
}
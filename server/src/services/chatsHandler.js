import { ObjectId } from "mongodb";
import { ChatRepo } from '../repositories/chatRepo'
import { UserRepo } from "../repositories/userRepo";
import { Authenticator } from "./authenticator";
import { APIsHandler } from "./APIsHandler";

export class ChatsHandler {

    /**
    * Fetches all convo by chatID
    * @param {string} token 
    * @param {string} chatID 
    * @returns {[ ({} | false), number ]} [chat | false, statusCode]
    */
    static async fetchChat(token, chatID) {
        let output = false
        try {
            const user = await Authenticator.auth(token)
            if (!user || !user.userID) return [false, 400]

            const userChatHistory = await UserRepo.getObjByID(user.userID)
            if (!userChatHistory) return [false, 500]

            const confirmOwnership = userChatHistory.chats.some(c => c.id.equals(new ObjectId(chatID)))
            if (!confirmOwnership) return [false, 401]

            const chat = await ChatRepo.getObjByID(chatID)
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

    /**
    * Handles incoming msg
    * @param {string} message
    * @param {string | null} token 
    * @param {string | null} chatID 
    * @returns {[ (string | false), (string | false),(string | false),(string | false),number ]} 
    * [katanemoResponse | false, smolResponse | false, token | false, chatID | false, statusCode]
    */
    static async sendMessage(message, token, chatID) {
        let output = false
        try {
            // Determine user type
            let userType = 'guest'
            let userID = null
            if (token) {
                const decodedToken = await Authenticator.auth(token)
                if (!decodedToken) return [false, false, token, chatID || false, 500]
                if (decodedToken.userID) {
                    userType = 'user'
                    userID = decodedToken.userID
                }
            }
            // Load conversation history
            let convoContextKatanemo = []
            let convoContextSmol = []
            if (chatID) {
                const chatContext = await ChatRepo.getObjByID(chatID)
                if (!chatContext) return [false, false, token || false, chatID, 500]
                convoContextKatanemo = chatContext.messages_katanemo_model
                convoContextSmol = chatContext.messages_smol_model
            }
            // Query both models
            let katanemoResponse = await APIsHandler.queryKatanemoModel(message, convoContextKatanemo)
            let smolResponse = await APIsHandler.querySmolModel(message, convoContextSmol)
            if (!katanemoResponse || !smolResponse) return [false, false, token || false, false, 500]

            // If no chat exists create new chat
            if (!chatID) {
                let q = 'Give a short title to the conversation'
                let title = await APIsHandler.queryKatanemoModel(q, [
                    { role: "user", content: message },
                    { role: "assistant", content: katanemoResponse }
                ])
                if (!title) title = 'New Chat'

                const newChat = await ChatRepo.addObj({
                    'title': title,
                    'messages_katanemo_model': [
                        { role: "user", content: message },
                        { role: "assistant", content: katanemoResponse }
                    ],
                    'messages_smol_model': [
                        { role: "user", content: message },
                        { role: "assistant", content: smolResponse }
                    ]
                })
                if (!newChat) return [false, false, token || false, false, 500]

                chatID = newChat

                // Add chat to user history
                if (userType === 'user') {
                    let saveChatInHistory = UserRepo.addChatToHistory(userID, { 'id': newChat, 'title': title })
                    if (!saveChatInHistory) return [false, false, token, false, 500]
                }

            } else {
                //Chat exists - append messages
                let updateChat = await ChatRepo.addMessage(chatID, message, katanemoResponse, smolResponse)
                if (!updateChat) return [false, false, token, chatID, 500]
            }

            // If guest create temp token with chatID
            if (!token) {
                const guestToken = await Authenticator.generateTempToken(chatID)
                if (!guestToken) return [false, false, false, chatID, 500]
                token = guestToken
            }

            output = 'ok'
            return [katanemoResponse, smolResponse, token, chatID, 201]

        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`ChatsHandler:sendMessage(${message}) -> `, output)
        }
    }

}
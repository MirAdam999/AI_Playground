import { ObjectId } from "mongodb";
import { ChatRepo } from '../repositories/chatRepo.js'
import { UserRepo } from "../repositories/userRepo.js";
import { Authenticator } from "./authenticator.js";
import { APIsHandler } from "./APIsHandler.js";
import { Limits } from "../utils/limits.js";

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

            output = chat
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
    * @returns {[ (string | false), (string | false),(string | false),(string | false),(string | false),(string | null),number ]} 
    * [katanemoResponse | false, smolResponse | false, token | false, chatID | false, chatTitle | false, warning | null, statusCode]
    */
    static async sendMessage(message, token, chatID) {
        let output = false
        let warning = null
        let chatTitle
        try {
            // Determine user type
            let userID = null
            if (token) {
                const decodedToken = await Authenticator.auth(token)
                if (!decodedToken) return [false, false, token, chatID || false, false, warning, 500]
                if (decodedToken.userID) {
                    userID = decodedToken.userID
                }
            }
            // Load conversation history
            let convoContextKatanemo = []
            let convoContextSmol = []
            if (chatID) {
                const chatContext = await ChatRepo.getObjByID(chatID)
                if (!chatContext) return [false, false, token || false, chatID, false, warning, 500]
                // convos up to x msg long (warning on x-4 msgs)
                if (chatContext.messages_katanemo_model.length === Limits.msgsInConvoMax - 4) warning = 'Chat length warning'
                convoContextKatanemo = chatContext.messages_katanemo_model
                convoContextSmol = chatContext.messages_smol_model
                chatTitle = chatContext.title
            }
            // Query both models
            let katanemoResponse = await APIsHandler.queryKatanemoModel(message, convoContextKatanemo)
            let smolResponse = await APIsHandler.querySmolModel(message, convoContextSmol)
            if (!katanemoResponse || !smolResponse) return [false, false, token || false, false, false, warning, 500]

            // If no chat exists create new chat
            if (!chatID) {
                let q = 'Give a short title to the conversation'
                let title = await APIsHandler.queryKatanemoModel(q, [
                    { role: "user", content: message },
                    { role: "assistant", content: katanemoResponse }
                ])
                if (!title) title = 'New Chat'

                const [newChat, maxChatsWarning] = await this._createChat(userID, title)
                if (!newChat) return [false, false, token || false, false, false, warning, 500]
                if (maxChatsWarning) warning = maxChatsWarning

                chatTitle = title
                chatID = newChat
            }

            // Append messages to the chat
            let updateChat = await ChatRepo.addMessage(chatID, message, katanemoResponse, smolResponse)
            if (!updateChat) return [false, false, token, chatID, false, warning, 500]


            // If guest create temp token with chatID
            if (!token) {
                const guestToken = await Authenticator.generateTempToken(chatID)
                if (!guestToken) return [false, false, false, chatID, false, warning, 500]
                token = guestToken
            }

            output = [katanemoResponse, smolResponse]
            return [katanemoResponse, smolResponse, token, chatID, chatTitle, warning, 201]

        } catch (e) {
            output = e.toString()
            return [false, false, false, false, false, warning, 500]
        } finally {
            console.log(`ChatsHandler:sendMessage(${message}) -> `, output)
        }
    }


    /**
    * Handles creation of new chat 
    * If chat belongs to a user, will add the chat to user history
    * Will issiue a warning if amount of chats for user is at limit
    * @param {string | null} userId 
    * @param {string} title 
    * @returns {[ (string | false), (string | null)]} 
    * [chatID | false, warning | null]
    */
    static async _createChat(userId, title) {
        let output = false
        let warning = null
        try {
            const newChat = {
                title,
                userId: new ObjectId(userId) || null, // track owner
                messages_katanemo_model: [],
                messages_smol_model: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const newChatId = await ChatRepo.addObj(newChat);
            if (!newChatId) return [false, warning]

            if (userId) {
                const [bindToUser, newWarning] = await this.bindChatToUser(newChatId, userId, title)
                if (!bindToUser) return [false, warning]
                if (newWarning) warning = newWarning
            }

            output = newChatId
            return [newChatId, warning]

        } catch (e) {
            output = e.toString()
            return [false, warning]
        } finally {
            console.log(`ChatsHandler:_createChat(${userId, title}) -> `, output)
        }
    }


    /**
    * Add the chat to user history
    * Will issiue a warning if amount of chats for user is at limit
    * @param {string} chatID 
    * @param {string} userId 
    * @param {string} title 
    * @returns {[ bool, (string | null)]} 
    * [bool, warning | null]
    */
    static async bindChatToUser(chatID, userId, title) {
        let maxChats = Limits.maxConvosStoredPerUser
        let warning = null
        let output = false
        try {        // Add chat to user history
            const bind = await UserRepo.addChatToHistory(userId, { id: chatID, title });
            if (!bind) return [false, warning]
            // Enforce chat limit 
            const userChats = await ChatRepo.getObjByFIlters({ userId: new ObjectId(userId) })

            if (userChats.length > maxChats) {
                userChats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first
                const excess = userChats.length - maxChats;
                const chatsToDelete = userChats.slice(0, excess);

                // Remove from Chat collection
                const deleteIds = chatsToDelete.map(c => c._id.toString());
                const deletedAll = await ChatRepo.deleteManyObjs(deleteIds);
                if (!deletedAll) return [false, warning]

                // Remove references from User.chats
                const userObj = await UserRepo.getObjByID(userId);
                if (userObj?.chats?.length) {
                    const filteredChats = userObj.chats.filter(c => !deleteIds.includes(c.id));
                    const updateUserHistory = await UserRepo.updateObj(userId, { chats: filteredChats });
                    if (!updateUserHistory) return [false, warning]
                }

                console.log(`Deleted ${excess} old chats for user ${userId}`);

            } else if (userChats.length === maxChats) {
                // issue warning if amount of chats for user is at limit
                warning = 'Max convos warning'
            }

            output = true
            return [true, warning]
        } catch (e) {
            output = e.toString()
            return [false, warning]
        } finally {
            console.log(`ChatsHandler:bindChatToUser(${userId, title}) -> `, output)
        }
    }
}
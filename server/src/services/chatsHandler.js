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

            const dbChat = await ChatRepo.getObjByID(chatID)
            if (!dbChat) return [false, 500]

            let chatFormatted = []
            for (let i = 0; i < dbChat.messages_katanemo_model.length; i += 2) {
                let userMsg = dbChat.messages_katanemo_model[i].content
                chatFormatted.push({ 'type': 'user', 'message': userMsg })

                let katMsg = dbChat.messages_katanemo_model[i + 1].content
                let smolMsg = dbChat.messages_smol_model[i + 1].content

                chatFormatted.push({ 'type': 'model', 'message': { 'katanemo': katMsg, 'smol': smolMsg } })
            }

            output = dbChat.title
            return [chatFormatted, 200]

        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`[ChatsHandler] fetchChat(${chatID}) -> `, output)
        }
    }

    /**
    * Delete convo by chatID
    * @param {string} token 
    * @param {string} chatID 
    * @returns {[ boolean, number ]} [true | false, statusCode]
    */
    static async deleteChat(token, chatID) {
        let output = false
        try {
            const user = await Authenticator.auth(token)
            if (!user || !user.userID) return [false, 400]

            const userChatHistory = await UserRepo.getObjByID(user.userID)
            if (!userChatHistory) return [false, 500]

            const confirmOwnership = userChatHistory.chats.some(c => c.id.equals(new ObjectId(chatID)))
            if (!confirmOwnership) return [false, 401]

            const del = await ChatRepo.deleteObj(chatID)
            if (!del) return [false, 500]

            output = true
            return [true, 204]
        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`[ChatsHandler] deleteChat(${chatID}) -> `, output)
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
            //let katanemoResponse = await APIsHandler.queryKatanemoModel(message, convoContextKatanemo)
            //let smolResponse = await APIsHandler.querySmolModel(message, convoContextSmol)
            let loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            let katanemoResponse = loremIpsum
            let smolResponse = loremIpsum
            if (!katanemoResponse || !smolResponse) return [false, false, token || false, false, false, warning, 500]

            // If no chat exists create new chat
            if (!chatID) {
                let q = 'Give a short title to the conversation'
                //let title = await APIsHandler.queryKatanemoModel(q, [
                // { role: "user", content: message },
                //{ role: "assistant", content: katanemoResponse }
                //])
                const randomInt = Math.floor(Math.random() * 100) + 1;
                let title = `New Chat No ${randomInt}`
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
                const guestToken = await Authenticator.generateTempToken(chatID, chatTitle)
                if (!guestToken) return [false, false, false, chatID, false, warning, 500]
                token = guestToken
            }

            output = [katanemoResponse.slice(0, 20), smolResponse.slice(0, 20)]
            return [katanemoResponse, smolResponse, token, chatID, chatTitle, warning, 201]

        } catch (e) {
            output = e.toString()
            return [false, false, false, false, false, warning, 500]
        } finally {
            console.log(`[ChatsHandler] sendMessage(${message.slice(0, 20)}) -> `, output)
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
                userId: null,
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
            console.log(`[ChatsHandler] _createChat(${userId, title}) -> `, output)
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
        try {
            const updateUserID = await ChatRepo.updateObj(chatID, { userId: new ObjectId(userId) })
            if (!updateUserID) return [false, warning]
            // Add chat to user history
            const bind = await UserRepo.addChatToHistory(userId, { id: chatID, title: title });
            if (!bind) return [false, warning]
            // Enforce chat limit 
            const userChats = await ChatRepo.getObjByFIlters({ userId: new ObjectId(userId) }) || []

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
            console.log(`[ChatsHandler] bindChatToUser(${userId, title}) -> `, output)
        }
    }
}
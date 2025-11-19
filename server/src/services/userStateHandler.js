import { UserRepo } from '../repositories/userRepo.js'
import { TokenRepo } from '../repositories/tokenRepo.js';
import { Authenticator } from './authenticator.js';
import { ObjectId } from "mongodb";
import { ChatsHandler } from './chatsHandler.js';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

export class UserStateHandler {

    /**
    * Cheks for temp token in order to bind chat to user chet history
    * Creates new uer in db (If temp token, binds (guest mode) chat to user's chat history),
    * generates user token (on faluire to gen token deletes the new user)
    * @param {string} email 
    * @param {string} pass 
    * @param {string | null} guestToken 
    * @returns {[ (string | false), number ]} [token | false, statusCode]
    */
    static async signUp(email, pass, guestToken) {
        let output = false
        try {
            if (guestToken) {
                const decodedToken = await Authenticator.auth(guestToken)
                if (!decodedToken || decodedToken.isGuest !== true) return [false, 400]
                var chatID = decodedToken.chatID
                var chatTitle = decodedToken.chatTitle
            }

            const pass_hash = crypto.createHash('sha256').update(pass + process.env.PASS_PEPPER).digest('hex')
            const userData = { email, pass_hash, chats: [] }
            if (chatID) userData.chats.push({ 'title': chatTitle, 'id': new ObjectId(chatID) })

            const newUserID = await UserRepo.addObj(userData);
            if (!newUserID) return [false, 500]

            const newUserToken = await Authenticator.generateUserToken(newUserID)
            if (!newUserToken) {
                await UserRepo.deleteObj(newUserID)
                return [false, 500]
            }

            output = `user ${newUserID} created`
            return [newUserToken, 201]

        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`UserStateHandler:signUp(${email}) -> `, output)
        }
    }


    /**
    * Cheks for temp token in order to bind chat to user chet history
    * Auths credentials against DB, revokes old token if exists, generates new user token
    * If temp token, binds (guest mode) chat to user's chat history
    * @param {string} email 
    * @param {string} pass 
    * @param {string | null} guestToken 
    * @returns {[ (string | false),[{}], number ]} [token | false, [chats{title, id}], statusCode]
    */
    static async logIn(email, pass, guestToken) {
        let output = false
        try {
            if (guestToken) {
                const decodedToken = await Authenticator.auth(guestToken)
                if (!decodedToken || decodedToken.isGuest !== true) return [false, [], 400]
                var chatID = decodedToken.chatID
                var chatTitle = decodedToken.chatTitle
            }

            const user = await UserRepo.getObjByFIlters({ 'email': email })
            if (!user) return [false, [], 401]

            const dbPass = user[0].pass_hash
            const hashedInput = crypto
                .createHash('sha256')
                .update(pass + process.env.PASS_PEPPER)
                .digest('hex')
            if (hashedInput !== dbPass) return [false, [], 401]

            const oldToken = await TokenRepo.getObjByFIlters({ 'userID': new ObjectId(user[0]._id) })
            if (oldToken) {
                await Authenticator.revokeToken(oldToken[0].token)
            }

            const newToken = await Authenticator.generateUserToken(user[0]._id)
            if (!newToken) return [false, [], 500]

            // fetch chat titles+ids
            const chats = user[0].chats

            if (chatID) {
                await ChatsHandler.bindChatToUser(user[0]._id, chatTitle)
            }

            output = `user ${user[0]._id} logged in`
            return [newToken, chats, 200]

        } catch (e) {
            output = e.toString()
            return [false, [], 500]
        } finally {
            console.log(`UserStateHandler:logIn(${email}) -> `, output)
        }
    }


    /**
    * Revokes user token
    * @param {string} token 
    * @returns {[ boolean , number ]} [bool, statusCode]
    */
    static async logOut(token) {
        let output = false
        try {
            const revoke = await Authenticator.revokeToken(token)
            if (!revoke) return [false, 500]

            output = 'logged out'
            return [true, 204]

        } catch (e) {
            output = e.toString()
            return [false, 500]
        } finally {
            console.log(`UserStateHandler:logOut() -> `, output)
        }
    }
}


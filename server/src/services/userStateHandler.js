import { UserRepo } from '../repositories/userRepo'
import { TokenRepo } from '../repositories/tokenRepo';
import { Authenticator } from './authenticator';
import { ObjectId } from "mongodb";
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
    * @returns {string | false} 
    */
    static async signUp(email, pass, guestToken) {
        let output = false
        try {
            if (guestToken) {
                const decodedToken = await Authenticator.auth(guestToken)
                if (!decodedToken || decodedToken.isGuest !== true) return false
                var chatID = decodedToken.chatID
                var chatTitle = decodedToken.chatTitle
            }

            const pass_hash = crypto.createHash('sha256').update(pass + process.env.PASS_PEPPER).digest('hex')
            const userData = { email, pass_hash, chats: [] }
            if (chatID) userData.chats.push({ 'title': chatTitle, 'id': new ObjectId(chatID) })

            const newUserID = await UserRepo.addObj(userData);
            if (!newUserID) return false

            const newUserToken = await Authenticator.generateUserToken(newUserID)
            if (!newUserToken) {
                await UserRepo.deleteObj(newUserID)
                return false
            }

            output = `user ${newUserID} created`
            return newUserToken

        } catch (e) {
            output = e.toString()
            return false
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
    * @returns {string | false} 
    */
    static async logIn(email, pass, guestToken) {
        let output = false
        try {
            if (guestToken) {
                const decodedToken = await Authenticator.auth(guestToken)
                if (!decodedToken || decodedToken.isGuest !== true) return false
                var chatID = decodedToken.chatID
                var chatTitle = decodedToken.chatTitle
            }

            const user = await UserRepo.getObjByFIlters({ 'email': email })
            if (!user) return false

            const dbPass = user[0].pass_hash
            const hashedInput = crypto
                .createHash('sha256')
                .update(pass + process.env.PASS_PEPPER)
                .digest('hex')
            if (hashedInput !== dbPass) return false

            const oldToken = await TokenRepo.getObjByFIlters({ 'userID': new ObjectId(user[0]._id) })
            if (oldToken) {
                await Authenticator.revokeToken(oldToken[0].token)
            }

            const newToken = await Authenticator.generateUserToken(user[0]._id)
            if (!newToken) return false

            if (chatID) {
                UserRepo.addChatToHistory(user[0]._id, { chatID, chatTitle })
            }

            const chats = user[0].chats
            // fetch chat names

            output = `user ${user[0]._id} logged in`
            return newToken

        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`UserStateHandler:logIn(${email}) -> `, output)
        }
    }


    /**
    * Revokes user token
    * @param {string} token 
    * @returns {boolean} 
    */
    static async logOut(token) {
        let output = false
        try {
            const revoke = await Authenticator.revokeToken(token)
            if (!revoke) return false

            output = 'logged out'
            return true

        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`UserStateHandler:logOut() -> `, output)
        }
    }
}


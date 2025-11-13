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
    * Creates new uer in db, generates user token (on faluire to gen token deletes the new user)
    * If temp token, binds (guest mode) chat to user's chat history
    * @param {string} email 
    * @param {string} pass 
    * @param {string | null} token 
    * @returns {string | false} 
    */
    static async signUp(email, pass, token) {
        let output = false
        try {
            if (token) {
                const decodedToken = await Authenticator.auth(token)
                if (!decodedToken || decodedToken.isGuest !== true) return false
                var chatID = decodedToken.chatID
            }

            const pass_hash = crypto.createHash('sha256').update(pass + process.env.PASS_PEPPER).digest('hex')
            const newUserID = await UserRepo.addObj({ 'email': email, 'pass_hash': pass_hash })
            if (!newUserID) return false

            const token = await Authenticator.generateUserToken(newUserID)
            if (!token) {
                UserRepo.deleteObj(newUserID)
                return false
            }

            if (chatID) {
                // Call ChatsHandler to update chat history for the user
            }

            output = `user ${newUserID} created`
            return token

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
    * Fetches user's chats history
    * @param {string} email 
    * @param {string} pass 
    * @param {string | null} token 
    * @returns {string | false} 
    */
    static async logIn(email, pass, token) {
        let output = false
        try {
            if (token) {
                const decodedToken = await Authenticator.auth(token)
                if (!decodedToken || decodedToken.isGuest !== true) return false
                var chatID = decodedToken.chatID
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
                // Call ChatsHandler to update chat history for the user
            }

            // fetch chat history using ChatsHandler

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
    * @param {string } token 
    * @returns {boolean} 
    */
    static async logOut(token) {
        let output = false
        try {
            const revoke = Authenticator.revokeToken(token)
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


import dotenv from "dotenv";
dotenv.config();
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ObjectId } from "mongodb";
import { TokenRepo } from '../repositories/tokenRepo.js'

/**
* Handles all token-related octivity: creation, deletion, authentication
*/

export class Authenticator {
    static jwt_secret = process.env.JWT_SECRET
    static token_pepper = process.env.TOKEN_PEPPER

    /**
    * @param {string} token 
    * @returns {{} | false} 
    */
    static _decodeToken(token) {
        let output
        try {
            const jwtSecretKey = this.jwt_secret
            const decoded = jwt.verify(token, jwtSecretKey);
            output = true
            return decoded
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`Authenticator:decodeToken() -> `, output)
        }
    }

    /**
    * Auths user: if guest will return decoded JWT, 
    * if user will compare token against DB before returning JWT
    * @param {string} token 
    * @returns {{} | false} 
    */
    static async auth(token) {
        let output = false
        try {
            const decoded_token = this._decodeToken(token)
            if (!decoded_token) return false

            if ('userID' in decoded_token) {
                const storedTokens = await TokenRepo.getObjByFIlters({ 'userID': new ObjectId(decoded_token.userID) })
                if (!storedTokens || !storedTokens.length) return false

                const storedHashedToken = storedTokens[0].token
                const hashedInput = crypto
                    .createHash('sha256')
                    .update(token + this.token_pepper)
                    .digest('hex')
                if (hashedInput !== storedHashedToken) return false

                output = `OK, userID: ${decoded_token.userID}`

            } else {
                output = `guest OK, chatID: ${decoded_token.chatID}`
            }

            return decoded_token
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`Authenticator:auth() -> `, output)
        }
    }

    /**
    * Generates JWT for guest
    * @param {string} chatID 
    * @returns {string | false} 
    */
    static generateTempToken(chatID) {
        let output
        try {
            const jwtSecretKey = this.jwt_secret
            const data = {
                chatID: chatID,
                isGuest: true,
                created: Date()
            }
            const token = jwt.sign(data, jwtSecretKey);
            output = 'temp token created'
            return token
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`Authenticator:generateTempToken(${chatID}) -> `, output)
        }
    }

    /**
    * Generates JWT for logged-in user
    * Saves hashed JWT in DB
    * @param {string} userID 
    * @returns {string | false} 
    */
    static async generateUserToken(userID) {
        let output
        try {
            let jwtSecretKey = this.jwt_secret
            let data = {
                userID: userID,
                isGuest: false,
                created: Date()
            }
            const token = jwt.sign(data, jwtSecretKey)
            const hashed = crypto.createHash('sha256').update(token + this.token_pepper).digest('hex')
            const addTokenToDB = await TokenRepo.addObj({ 'token': hashed, 'userID': new ObjectId(userID) })
            if (addTokenToDB) {
                output = 'token created'
                return token
            } else {
                output = false
                return false
            }
        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`Authenticator:generateUserToken(${userID}) -> `, output)
        }
    }

    /**
    * Compare token against DB, then delete the token from DB
    * @param {string} token 
    * @returns {boolean} 
    */
    static async revokeToken(token) {
        let output = false
        try {
            const decoded_token = this._decodeToken(token)
            if (!decoded_token || !decoded_token.userID) return false

            const storedTokens = await TokenRepo.getObjByFIlters({ 'userID': new ObjectId(decoded_token.userID) })
            if (!storedTokens || !storedTokens.length) return false

            const storedHashedToken = storedTokens[0].token
            const hashedInput = crypto
                .createHash('sha256')
                .update(token + this.token_pepper)
                .digest('hex')
            if (hashedInput !== storedHashedToken) return false

            const deleteTokenFromDB = await TokenRepo.deleteObj(storedTokens[0]._id)
            if (!deleteTokenFromDB) return false

            output = `token revoked for userID ${decoded_token.userID}`
            return true

        } catch (e) {
            output = e.toString()
            return false
        } finally {
            console.log(`Authenticator:revokeToken() -> `, output)
        }
    }
}
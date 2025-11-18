import { UserStateHandler } from '../services/userStateHandler'
import dotenv from "dotenv";
dotenv.config();

const tokenHeaderKey = process.env.TOKEN_HEADER_KEY
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,12}$/

export async function signUp(req, res) {
    try {
        const email = req.body.email
        const pass = req.body.pass
        const guestToken = req.headers[tokenHeaderKey] || null

        if (guestToken && typeof guestToken !== "string") {
            return res.status(400).json({ error: "Bad Request" })
        }

        if (!email || typeof email !== "string" || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" })
        }

        if (!pass || typeof pass !== "string" || !passRegex.test(pass)) {
            return res.status(400).json({
                error: "Password must be 8–12 chars, and contain at least one lowercase, uppercase, and a number"
            })
        }

        const [userToken, statusCode] = await UserStateHandler.signUp(email, pass, guestToken)
        if (userToken) {
            res.status(statusCode).json({ userToken: userToken })
        } else {
            res.status(statusCode).json({ error: 'server err' })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export async function logIn(req, res) {
    try {
        const email = req.body.email
        const pass = req.body.pass
        const guestToken = req.headers[tokenHeaderKey] || null

        if (guestToken && typeof guestToken !== "string") {
            return res.status(400).json({ error: "Bad Request" })
        }

        if (!email || typeof email !== "string" || !emailRegex.test(email)) {
            return res.status(400).json({ error: "Wrong Email or Password" })
        }

        if (!pass || typeof pass !== "string" || !passRegex.test(pass)) {
            return res.status(400).json({ error: "Wrong Email or Password" })
        }

        const [userToken, chatHistory, statusCode] = await UserStateHandler.logIn(email, pass, guestToken)
        if (userToken) {
            res.status(statusCode).json({ userToken: userToken, chatHistory: chatHistory })
        } else if (statusCode === 401) {
            res.status(statusCode).json({ error: "Wrong Email or Password" })
        } else {
            res.status(statusCode).json({ error: 'server err' })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export async function logOut(req, res) {
    try {
        const userToken = req.headers[tokenHeaderKey]

        if (!userToken || typeof userToken !== "string") {
            return res.status(400).json({ error: "Bad Request" })
        }

        const [loggedOut, statusCode] = await UserStateHandler.logOut(userToken)
        if (loggedOut) {
            res.status(statusCode).json({ loggedOut: true })
        } else {
            res.status(statusCode).json({ error: 'server err' })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
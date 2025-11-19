import { ChatsHandler } from '../services/chatsHandler.js'
import { Limits } from '../utils/limits.js';
import dotenv from "dotenv";
dotenv.config();

const tokenHeaderKey = process.env.TOKEN_HEADER_KEY

export async function fetchChat(req, res) {
    try {
        const chatID = req.params.chatID
        const token = req.headers[tokenHeaderKey]

        if (!token || typeof token !== "string" || !chatID || typeof chatID !== "string") {
            return res.status(400).json({ error: "Bad Request" })
        }

        const [chat, statusCode] = await ChatsHandler.fetchChat(token, chatID)
        console.error([chat, statusCode])
        if (chat) {
            res.status(statusCode).json({ token: token, chatID: chatID, chat: chat })
        } else if (statusCode === 400 || statusCode === 401) {
            res.status(statusCode).json({ error: "Bad Request" })
        } else {
            res.status(statusCode).json({ error: 'server err' })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export async function sendMessage(req, res) {
    try {
        const request_chatID = req.params.chatID || null
        const request_token = req.headers[tokenHeaderKey] || null
        const msg = req.body.msg

        if ((request_token && typeof request_token !== "string") || (request_chatID && typeof request_chatID !== "string")) {
            return res.status(400).json({ error: "Bad Request" })
        }

        if (!msg || typeof msg !== "string") {
            msg = ''
        }

        if (msg.length > Limits.charsPerMsg) {
            return res.status(400).json({ error: "Too long of a msg" })
        }

        const [katanemoResponse, smolResponse, token, chatID, chatTitle, warning, statusCode] = await ChatsHandler.sendMessage(msg, request_token, request_chatID)
        if (statusCode === 201) {
            res.status(statusCode).json({
                katanemoResponse: katanemoResponse,
                smolResponse: smolResponse,
                token: token,
                chatID: chatID,
                chatTitle: chatTitle,
                warning: warning,
                statusCode: statusCode
            })
        } else {
            res.status(statusCode).json({ error: 'server err' })
        }


    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
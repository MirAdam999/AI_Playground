import express from "express";
import { fetchChat, sendMessage } from '../controllers/chatController.js'

const router = express.Router();

router.get("/get_chat/:chatID", fetchChat);
router.post("/send_message", sendMessage);

export default router;
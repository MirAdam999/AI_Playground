import express from "express";
import { fetchChat, sendMessage } from '../controllers/chatController.js'

const router = express.Router();

router.post("/get_chat/:chatID", fetchChat);
router.post("/send_message/:chatID", sendMessage);

export default router;
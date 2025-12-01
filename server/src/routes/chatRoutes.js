import express from "express";
import { fetchChat, sendMessage, deleteChat } from '../controllers/chatController.js'

const router = express.Router();

router.get("/get_chat/:chatID", fetchChat);
router.post("/send_message", sendMessage);
router.delete("/delete_chat/:chatID", deleteChat);

export default router;
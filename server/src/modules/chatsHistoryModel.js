import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const chatHistorySchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
    chats: [{ type: Types.ObjectId, ref: "Chat" }], // <-- array of chat references
}, { timestamps: true });

const ChatHistory = model("ChatHistory", chatHistorySchema);
export default ChatHistory;
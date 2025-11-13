import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const chatHistorySchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
    chats: [
        {
            name: { type: String, required: true },
            id: { type: Types.ObjectId, ref: "Chat", required: true },
        },
    ]
}, { timestamps: true });

const ChatHistory = model("ChatHistory", chatHistorySchema);
export default ChatHistory;
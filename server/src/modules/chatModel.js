import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const chatSchema = new Schema({
    title: { type: String, default: 'New Chat' },
    messages: [
        {
            message: { type: String, required: true },
            role: { type: String, enum: ["user", "assistant", "system"], required: true },
            datetime: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Chat = model("Chat", chatSchema);
export default Chat;
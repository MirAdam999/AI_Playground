import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const chatSchema = new Schema({
    title: { type: String, default: 'New Chat' },
    messages_katanemo_model: [
        {
            role: { type: String, enum: ["user", "assistant"], required: true },
            content: { type: String, required: true }
        }
    ],
    messages_smol_model: [
        {
            role: { type: String, enum: ["user", "assistant"], required: true },
            content: { type: String, required: true },
        }
    ]
}, { timestamps: true });

const Chat = model("Chat", chatSchema);
export default Chat;
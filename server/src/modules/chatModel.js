import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const chatSchema = new Schema({
    user: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
}, { timestamps: true });

const Chat = model("Chat", chatSchema);
export default Chat;
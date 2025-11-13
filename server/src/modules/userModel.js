import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pass_hash: { type: String, required: true },
    chats: [
        {
            title: { type: String, required: true },
            id: { type: Types.ObjectId, ref: "Chat", required: true },
        },
    ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
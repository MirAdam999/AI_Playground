const { ObjectId } = mongoose.Schema.Types;
import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userID: { type: ObjectId, ref: "User", required: true, unique: true },
}, { timestamps: true });

const Token = mongoose.model("Token", tokenSchema);
export default Token;
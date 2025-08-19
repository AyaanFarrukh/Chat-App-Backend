import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.ObjectId , required: true , ref: "Users" },
    receiver: { type: mongoose.Schema.ObjectId , required: true , ref: "Users" },
    text: { type: String , default: "" },
    imageUrl: { type: String , default: "" },
    videoUrl: { type: String , default: "" },
    seen: { type: Boolean, default: false }
},{ timestamps: true });

const ConversationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.ObjectId , required: true , ref: "Users" },
    receiver: { type: mongoose.Schema.ObjectId , required: true , ref: "Users" },
    messages: [MessageSchema]
},{ timestamps: true });

export const Messages = mongoose.model("Messages", MessageSchema);
export const Conversations = mongoose.model("Conversations", ConversationSchema);
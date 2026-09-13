import mongoose from "mongoose";

const messsageSchema = new mongoose.Schema({
    text: {
        type: String,

    },
    image:{
        type: String,
        
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },


},
    { timestamps: true }
)

export default mongoose.model("Message", messsageSchema);
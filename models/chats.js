import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const chatSchema = new mongoose.Schema({
    user: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    tour_operator: {
        ref: "touroperators",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    tour_and_activity: {
        ref: "toursandactivities",
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    send_by: {
        type: String,
        required: true
    },
    received_by: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)

chatSchema.plugin(mongooseUniqueValidator)
const Chats = new mongoose.model('chats', chatSchema)

export default Chats
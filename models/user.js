import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({

    first_name : {
        type: String,
        required : true,
        trim: true
    },
    last_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: Date,
        required: true
    }
},
    { timestamps: true }
)

userSchema.plugin(mongooseUniqueValidator)
const Users = new mongoose.model('users', userSchema)

export default Users
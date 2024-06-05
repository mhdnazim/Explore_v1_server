import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const bookingSchema = new mongoose.Schema({
    
    user: {
        ref: "users",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    tour_operator: {
        ref: "touroperators",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    tour_and_activity: {
        ref: "toursandactivities",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    phone_number: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pickup_point: {
        type: String,
        required: true
    },
    special_requirements: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    no_of_persons: {
        type: Number,
        required: true
    },
    total_cost: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        required: true
    },
    payment_status: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: "pending"
    },
    isCancelled: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

bookingSchema.plugin(mongooseUniqueValidator)
const Bookings = new mongoose.model('bookings',
    bookingSchema
)

export default Bookings
import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const reviewSchema = new mongoose.Schema({
    
    reviewer: {
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
    rating: {
        type: Number,
        required: true
    },
    review_title: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    }
},
    { timestamps: true }
)

reviewSchema.plugin(mongooseUniqueValidator)
const Reviews = new mongoose.model('Reviews',
    reviewSchema
)

export default Reviews
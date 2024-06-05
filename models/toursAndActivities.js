import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const tourAndActivitiesSchema = new mongoose.Schema({
    tour_operator: {
        ref: "touroperators",
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    destination: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    duration: {
        type: Number,
        required: true
    },
    itinerary: [
        {
            itinerary: {
                type: String,
                required: false
            },
            step: {
                type: Number,
                // required: true
            },
        }
    ],
    highlight: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: Number,
        required: true
    },
    activity_type: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isShown: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

tourAndActivitiesSchema.index({ coordinates: "2dsphere" });

tourAndActivitiesSchema.plugin(mongooseUniqueValidator);

const ToursAndActivities = mongoose.model('toursandactivities', tourAndActivitiesSchema);

export default ToursAndActivities;

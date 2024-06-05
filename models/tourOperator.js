import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";


const tourOperatorSchema = new mongoose.Schema({

    name: {
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
    location: {
        type: String,
        required: true
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
    }
},
{
    timestamps: true
})

tourOperatorSchema.index({ coordinates: "2dsphere" });
tourOperatorSchema.plugin(mongooseUniqueValidator)
const Touroperators = new mongoose.model('touroperators',
    tourOperatorSchema
)

export default Touroperators
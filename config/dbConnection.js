import mongoose from "mongoose"
import ToursAndActivities from "../models/toursAndActivities.js";

const connectDB = async () => {

    try {
        const connection = await mongoose.connect(process.env.DATA_BASE)
        console.log(`MongoDB Connected : ${connection.connection.host}`)
        await ToursAndActivities.init();
        console.log("Indexes ensured");
    } catch (error) {
        console.error(`Error : ${error.message}`)
        process.exit(1)
    }
    
}

export default connectDB
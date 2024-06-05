import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import ToursAndActivities from "../models/toursAndActivities.js"
import * as fs from 'fs'
import path from "path"

export const tourList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { search, duration, fromPrice, toPrice, activity_type, tour_operator, latitude, longitude } = req.body

            const query = { isDeleted: false, isShown: true }

            if(search){
                const searchQuery = search.toLowerCase()
                query.$or = [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { destination: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            if ( latitude && longitude ){
                query.coordinates = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [ parseFloat(longitude), parseFloat(latitude)  ]  // In float
                        },
                        $minDistance: 0,
                        $maxDistance: 30000 // In meters (10 km)
                    }
                }
            }

            if ( activity_type ){
                const activity_type_str = activity_type.toLowerCase()
                query.activity_type = { $regex: activity_type_str, $options: 'i' }
            }

            if ( fromPrice && toPrice ){
                query.price = { $gte: fromPrice, $lte: toPrice }
            }

            if (duration){
                query.duration = { $lte: duration }
            }

            if (tour_operator){
                query.tour_operator = tour_operator
            }
            
            const tourData = await ToursAndActivities.find(query)
            .populate({
                path: 'tour_operator',
                select: 'name'
            })


            res.status(200).json({
                status: true,
                message: '',
                data: tourData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const myTours = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { tour_operator } = req.body

            const query = { isDeleted: false }
            if (tour_operator){
                query.tour_operator = tour_operator
            }
            
            const tourData = await ToursAndActivities.find(query)

            res.status(200).json({
                status: true,
                message: '',
                data: tourData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


export const viewTour = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { _id } = req.body
            const query = { isDeleted: false }

            if( _id ){
                query._id = _id
            }
            const tourData = await ToursAndActivities.findOne(query)
            .populate({
                path: 'tour_operator',
                select: 'name email phone_number'
            })

            res.status(200).json({
                status: true,
                message: '',
                data: tourData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const addTourAndActivity = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log(errors, "error");
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422));
        } else {
            const { role } = req.userData;

            if (role === "Tour Operator") {
                const { tour_operator, title, latitude,destination, longitude, description, duration, itinerary, price, availability, activity_type } = req.body;

                const highlight = req.file ? process.env.BASE_URL + "/tours_and_activity/highlights/" + req.file.filename : null;

                const newActivity = new ToursAndActivities({
                    tour_operator,
                    title: title.toLowerCase(),
                    coordinates: {
                        type: "Point",
                        coordinates: [ parseFloat(longitude), parseFloat(latitude) ]
                    },
                    duration,
                    destination,
                    description,
                    itinerary: JSON.parse(itinerary.toLowerCase()),
                    price,
                    availability,
                    activity_type: activity_type.toLowerCase(),
                    highlight
                });

                await newActivity.save();
                res.status(200).json({
                    status: true,
                    message: 'New Plan successfully added...!',
                    data: null,
                    access_token: null
                });
            } else {
                res.status(406).json({
                    status: false,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                });
            }
        }
    } catch (err) {
        console.error(err);
        return next(new HttpError("Oops! Process failed, please do contact admin", 500));
    }
};

export const editTour = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData

            if (role === "Tour Operator") {
                const {  _id, tour_operator, title, destination, longitude, latitude, description, duration, price, availability, activity_type } = req.body

                const tourData = await ToursAndActivities.findOne({ _id })

                const highlight = req.file ? process.env.BASE_URL + "/tours_and_activity/highlights/" + req.file.filename: tourData.highlight

                if (req.file && tourData.highlight !== null) {
                    const prevImgPath = tourData.highlight.slice(22)
                    fs.unlink(`./uploads/${ prevImgPath }`, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    })
                }

                const updateTour = await ToursAndActivities.findOneAndUpdate({ _id }, {
                    tour_operator, tour_operator,
                    title: title.toLowerCase(), 
                    coordinates: {
                        type: "Point",
                        coordinates: [ parseFloat(longitude), parseFloat(latitude) ]
                    },
                    duration,
                    description,  
                    destination,
                    price, 
                    availability, 
                    activity_type: activity_type.toLowerCase(), 
                    highlight
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: '',
                    data: updateTour,
                    access_token: null
                })
            } else {
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
            
        }

    }
    catch (err){
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// edit itinerary

export const editItinerary = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData
            const {  _id, step, message } = req.body
            const tourData = await ToursAndActivities.findOne({ "itinerary._id": _id })

            const itineraryData = tourData.itinerary
            
            if ( role === "Tour Operator" ) {
                itineraryData.map( itinerary =>{
                    if (  itinerary.step === step ){
                        itinerary.itinerary = message
                    }
                } )
    
                tourData.itinerary = itineraryData
                await tourData.save()
                res.status(200).json({
                    status: true,
                    message: '',
                    data: tourData,
                    access_token: null
                })
            } else {
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
            
        }

    }
    catch (err){
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


// add itinerary

export const addItinerary = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData
            const {  _id, message } = req.body
            const tourData = await ToursAndActivities.findOne({ _id })

            const itineraryData = tourData.itinerary

            
            if ( role === "Tour Operator" ) {
                const newItinerary = { step: itineraryData.length + 1, itinerary : message}
                        
                itineraryData.push(newItinerary)
                tourData.itinerary = itineraryData

                await tourData.save()
                res.status(200).json({
                    status: true,
                    message: '',
                    data: tourData,
                    access_token: null
                })
            } else {
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
            
        }

    }
    catch (err){
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


// delete itinerary

export const deleteItinerary = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData
            const {  _id } = req.body
            const tourData = await ToursAndActivities.findOne({ _id })

            const itineraryData = tourData.itinerary

            
            if ( role === "Tour Operator" ) {
                        
                itineraryData.pop()
                tourData.itinerary = itineraryData

                await tourData.save()
                res.status(200).json({
                    status: true,
                    message: '',
                    data: tourData,
                    access_token: null
                })
            } else {
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
            
        }

    }
    catch (err){
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


export const deleteTour = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData

            if (role === "Tour Operator") {
                const { _id } = req.body

                const deletedTour = await ToursAndActivities.findOneAndUpdate({ _id }, {
                    isDeleted: true
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: '',
                    data: deletedTour,
                    access_token: null
                })
            } else { 
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
        }
    } catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const hideTour = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { role } = req.userData

            if (role === "Tour Operator") {
                const { _id } = req.body

                let HideTour = null

                const tourData = await ToursAndActivities.findOne({ _id })

                if ( tourData.isShown === false ){
                    HideTour = await ToursAndActivities.findOneAndUpdate({ _id }, {
                        isShown: true
                    }, { new: true })
                } else {
                    HideTour = await ToursAndActivities.findOneAndUpdate({ _id }, {
                        isShown: false
                    }, { new: true })
                }
                res.status(200).json({
                    status: true,
                    message: '',
                    data: HideTour,
                    access_token: null
                })
            } else { 
                res.status(406).json({
                    status: true,
                    message: 'Permission denied...',
                    data: null,
                    access_token: null
                })
            }
        }
    } catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}
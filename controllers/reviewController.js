import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import Reviews from "../models/review.js"

export const addReviews = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            const { reviewer, tour_operator, tour_and_activity, rating, review_title, review } = req.body
            
            const reviewed = await Reviews.findOne({ reviewer, tour_and_activity })

            if ( reviewed ){
                res.status(409).json({
                    status: true,
                    message: 'Already Reviewed',
                    data: [],
                    access_token: null
                })
            }else {
                const newReview = new Reviews({
                    reviewer, 
                    tour_operator, 
                    tour_and_activity, 
                    rating, 
                    review_title: review_title.toLowerCase(), 
                    review: review.toLowerCase()
                })
                await newReview.save()
                res.status(200).json({
                    status: true,
                    message: '',
                    data: newReview,
                    access_token: null
                })
            }

        }
    }
    catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// list all reviews
export const reviewList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {

            const { tour_and_activity } = req.body
            const query = {}

            if ( tour_and_activity ){
                query.tour_and_activity = tour_and_activity
            }

            const reviewData = await Reviews.find(query)
                .populate({
                    path: 'reviewer',
                    select: "first_name last_name"
                })
                .populate({
                    path: 'tour_operator',
                    select: "name location"
                })
                .populate({
                    path: 'tour_and_activity',
                    select: "title coordinates"
                })

            res.status(200).json({
                status: true,
                message: '',
                data: reviewData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// view Review 
export const viewReview = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {

            const { tour_and_activity, reviewer } = req.body
            const query = {}

            if ( tour_and_activity && reviewer ){
                query.tour_and_activity = tour_and_activity
                query.reviewer = reviewer
            }

            const reviewData = await Reviews.findOne(query)
                .populate({
                    path: 'reviewer',
                    select: "first_name last_name"
                })
                .populate({
                    path: 'tour_operator',
                    select: "name location"
                })
                .populate({
                    path: 'tour_and_activity',
                    select: "title destination"
                })

            res.status(200).json({
                status: true,
                message: '',
                data: reviewData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}


export const editReview = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            console.log("error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
            
            const { _id, rating, review_title, review } = req.body

                const updateReview = await Reviews.findOneAndUpdate({ _id }, {
                     rating, 
                     review_title: review_title.toLowerCase(), 
                     review: review.toLowerCase()
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: '',
                    data: updateReview,
                    access_token: null
                })
            } 

    }
    catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

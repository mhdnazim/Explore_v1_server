import { validationResult } from "express-validator"
import Bookings from "../models/bookings.js"
import HttpError from "../middlewares/httpError.js"
import { sendApproveMail, sendBookingMail, sendCancelBookingMail } from "../services/nodemailer.js"
import { stripePayment } from "../util/stripe.js"
import { currencyConverter } from "../util/currencyConverter.js"
import { io } from "../app.js"


// Add Booking 
export const addBooking = async (req, res, next) => {
    try {

        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log(errors, "error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
                const { user, tour_operator, tour_and_activity, phone_number, email, special_requirements, date, time, no_of_persons, pickup_point, payment_mode, total_cost } = req.body

                const preBooked = await Bookings.findOne({ user, tour_and_activity, status: "pending", isDeleted: false })

                if ( preBooked ) {
                    res.status(208).json({
                        status: false,
                        message: 'Your booking Already in Que...',
                        data: null,
                        access_token: null
                    }) 
                } else {
                    const newBooking = new Bookings({
                        user, 
                        tour_operator,
                        tour_and_activity, 
                        phone_number, 
                        email: email.toLowerCase(), 
                        pickup_point: pickup_point.toLowerCase(),
                        payment_mode: payment_mode.toLowerCase(), 
                        special_requirements: special_requirements.toLowerCase(), 
                        date, 
                        time, 
                        no_of_persons,
                        total_cost
                    })
                    await newBooking.save()
                
                    const { finalValue } = await currencyConverter( total_cost )

                    if ( newBooking.payment_mode === "card" ) {
                        const { sessionId } = await stripePayment( finalValue, newBooking._id, "add" )
                        await sendBookingMail("./services/template/emailTemplate.pug")
                        io.emit('sendMessage', true)
                        res.status(200).json({
                            status: true,
                            message: 'New Booking successfully added...!',
                            data: null,
                            sessionId: sessionId,
                            access_token: null
                        }) 
                    } else { 
                        await sendBookingMail("./services/template/emailTemplate.pug")
                        io.emit('sendMessage', true)
                        res.status(200).json({
                            status: true,
                            message: 'New Booking successfully added...!',
                            data: null,
                            access_token: null
                        }) 
                    }

                }
                
        }
    }
    catch (err){
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// edit Booking 
export const editBooking = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log(errors, "error")
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {
                const { _id, phone_number, email, special_requirements, date, time, no_of_persons, pickup_point, payment_mode, total_cost } = req.body

                const findBooking = await Bookings.findOne({ _id, status: "pending" })


                if ( findBooking ){

                    if ( (findBooking.no_of_persons < no_of_persons && payment_mode === "card") || ( payment_mode === "card" && findBooking.payment_mode !== "card") ){

                        let existingAmount = 0
                        if ( total_cost === findBooking.total_cost ){
                            existingAmount = total_cost
                        } else if ( payment_mode === "card" && findBooking.payment_mode !== "card" ) {
                            existingAmount = total_cost
                        } else {
                            existingAmount = total_cost - findBooking.total_cost
                        }

                        const { finalValue } = await currencyConverter( existingAmount )
                        const { sessionId } = await stripePayment( finalValue, findBooking._id, "edit" )

                        const editBooking = await Bookings.findOneAndUpdate({ _id }, {
                            phone_number, 
                            email: email.toLowerCase(), 
                            pickup_point,
                            payment_mode: payment_mode.toLowerCase(), 
                            special_requirements: special_requirements.toLowerCase(), 
                            date, 
                            time, 
                            no_of_persons,
                            total_cost
                        }, { new: true })
                        await editBooking.save()
                        io.emit('sendMessage', true)
                        res.status(200).json({
                            status: true,
                            message: 'Booking successfully edited...!',
                            data: null,
                            sessionId: sessionId,
                            access_token: null
                        }) 
                    } else {
                        const editBooking = await Bookings.findOneAndUpdate({ _id }, {
                            phone_number, 
                            email: email.toLowerCase(), 
                            pickup_point,
                            payment_mode: payment_mode.toLowerCase(), 
                            special_requirements: special_requirements.toLowerCase(), 
                            date, 
                            time, 
                            no_of_persons,
                            total_cost
                        }, { new: true })
                        await editBooking.save()
                        io.emit('sendMessage', true)
                        res.status(200).json({
                            status: true,
                            message: 'Booking successfully edited...!',
                            data: null,
                            access_token: null
                        }) 
                    }
                } else {
                    res.status(403).json({
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

// list booking 
export const bookingList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            
            const { role } = req.userData

            let bookData = ""

            const query = { isDeleted: false }

            if (role === "Tour Operator") {

                const { user } = req.body

                if ( user ){
                    query.tour_operator = user
                }
    
                bookData = await Bookings.find(query)
                .populate({
                    path: 'user',
                    select: 'first_name last_name'
                })
                .populate({
                    path: 'tour_operator',
                    select: 'name'
                }).populate({
                    path: 'tour_and_activity',
                    select: 'highlight title destination price'
                })

            } else {
                const { user } = req.body

                if ( user ){
                    query.user = user
                }
    
                bookData = await Bookings.find(query)
                .populate({
                    path: 'user',
                    select: 'first_name last_name'
                })
                .populate({
                    path: 'tour_operator',
                    select: 'name'
                }).populate({
                    path: 'tour_and_activity',
                    select: 'highlight title destination price'
                })

            }
            
            res.status(200).json({
                status: true,
                message: '',
                data: bookData,
                access_token: null
            })

        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// cancel booking 

export const cancelBooking = async (req, res, next) => {
    try {
            const errors = validationResult(req)

            if (! errors.isEmpty()) {
                console.log("error")
                return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
            } else {
                const { role } = req.userData
                const { Booking_id } = req.body
                let cancelBooking = ""

                if (role === "Tour Operator") {
                    cancelBooking = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        isCancelled: "by operator",
                        status: "cancelled"
                    }, { new: true }) 
                } else if ( role === "user" ){
                    cancelBooking = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        isCancelled: "by user",
                        status: "cancelled"
                    }, { new: true })
                } 
                await sendCancelBookingMail("./services/template/emailTemplate.pug")
                io.emit('sendMessage', true)
                res.status(200).json({
                        status: true,
                        message: '',
                        data: cancelBooking,
                        access_token: null
                    })
                } 
        }
     catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// approve booking 

export const approveBooking = async (req, res, next) => {
    try {
            const errors = validationResult(req)

            if (! errors.isEmpty()) {
                console.log("error")
                return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
            } else {
                const { role } = req.userData
                const { Booking_id } = req.body

                if (role === "Tour Operator") {
                    const approveBooking = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        status: "approved"
                    }, { new: true }) 
                    await sendApproveMail("./services/template/emailTemplate.pug")
                    io.emit('sendMessage', true)
                    res.status(200).json({
                        status: true,
                        message: '',
                        data: approveBooking,
                        access_token: null
                    })
                }  else {
                    res.status(403).json({
                        status: true,
                        message: 'Permission Denied',
                        data: [],
                        access_token: null
                    })
                }
                } 
        }
     catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// complete booking 

export const completeBooking = async (req, res, next) => {
    try {
            const errors = validationResult(req)

            if (! errors.isEmpty()) {
                console.log("error")
                return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
            } else {
                const { role } = req.userData
                const { Booking_id } = req.body

                // if (role === "Tour Operator") {
                    const BookingCompleted = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        status: "completed"
                    }, { new: true }) 
                    res.status(200).json({
                        status: true,
                        message: '',
                        data: BookingCompleted,
                        access_token: null
                    })
                }
        }
     catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// complete payment 

export const completePayment = async (req, res, next) => {
    try {
            const errors = validationResult(req)

            if (! errors.isEmpty()) {
                console.log("error")
                return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
            } else {
                const { Booking_id } = req.body
                    const BookingCompleted = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        payment_status: true
                    }, { new: true }) 
                    io.emit('sendMessage', true)
                    res.status(200).json({
                        status: true,
                        message: '',
                        data: BookingCompleted,
                        access_token: null
                    })
                }
        }
     catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

//  payment failed

export const paymentFailed = async (req, res, next) => {
    try {
        const { Booking_id } = req.body
            const errors = validationResult(req)
            
            if (! errors.isEmpty()) {
                console.log("error")
                return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
            } else {
                    const BookingCompleted = await Bookings.findOneAndUpdate({ _id: Booking_id }, {
                        isDeleted: true
                    }, { new: true }) 
                    io.emit('sendMessage', true)
                    res.status(200).json({
                        status: true,
                        message: '',
                        data: BookingCompleted,
                        access_token: null
                    })
                }
        }
     catch(err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

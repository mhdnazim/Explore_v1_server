import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import bcrypt from "bcrypt"
import Touroperators from "../models/tourOperator.js"
import Users from "../models/user.js"

export const tourOperatorRegister = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error",errors)
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {

            const { name, location, longitude, latitude, email, password, phone_number } = req.body

            const preTourOperator = await Touroperators.findOne({ email: email.toLowerCase().replace(/\s+/g, ' ').replace(/[&\/\\#, +()$~%'":*?<>{}-]/g, '_') })
            const preUser = await Users.findOne({ email: email.toLowerCase().replace(/\s+/g, ' ').replace(/[&\/\\#, +()$~%'":*?<>{}-]/g, '_') })

            if (preUser || preTourOperator) {
                res.status(406).json({
                    status: true,
                    message: 'user already exists',
                    data: null,
                    access_token: null
                })

            } else {
                const saltValue = parseInt(process.env.SALT_ROUNDS)
                const salt = bcrypt.genSaltSync(saltValue)
                const hash = bcrypt.hashSync(password, salt)

                const newTourOperator = new Touroperators({
                    name: name.toLowerCase(), 
                    coordinates: {
                        type: "Point",
                        coordinates: [ parseFloat(longitude), parseFloat(latitude) ]
                    },
                    location, 
                    email: email.toLowerCase().replace(/\s+/g, ' ').replace(/[&\/\\#, +()$~%'":*?<>{}-]/g, '_'), 
                    password: hash,
                    phone_number
                })
                await newTourOperator.save()
                res.status(200).json({
                    status: true,
                    message: 'Tour operator registered successfully...!',
                    data: null,
                    access_token: null
                })

            }
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// list all tour operators
export const operatorsList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {

            const { search, longitude, latitude } = req.body
            
            const query = { }

            if( search ){
                const searchQuery = search.toLowerCase()
                query.$or = [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { location: { $regex: searchQuery, $options: 'i' } }
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

            const operatorData = await Touroperators.find(query)

            res.status(200).json({
                status: true,
                message: '',
                data: operatorData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// find tour operators
export const findOperators = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
        const { tour_operator } = req.body
            const operatorData = await Touroperators.findOne({ _id: tour_operator })

            res.status(200).json({
                status: true,
                message: '',
                data: operatorData,
                access_token: null
            })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}
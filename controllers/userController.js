import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import Users from "../models/user.js"
import bcrypt from "bcrypt"
import Touroperators from "../models/tourOperator.js"

export const userRegister = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error",errors)
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {

            const { first_name, last_name, gender, email, password, date_of_birth, phone_number } = req.body

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

                const newUser = new Users({
                    first_name: first_name.toLowerCase(), 
                    last_name: last_name.toLowerCase(), 
                    gender: gender.toLowerCase(), 
                    email: email.toLowerCase().replace(/\s+/g, ' ').replace(/[&\/\\#, +()$~%'":*?<>{}-]/g, '_'), 
                    password: hash, 
                    date_of_birth, 
                    phone_number
                })
                await newUser.save()
                res.status(200).json({
                    status: true,
                    message: 'User registered successfully...!',
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

export const findUserDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { _id } = req.body

            const userData = await Users.findOne({ _id })

            res.status(200).json({
                status: true,
                message: '',
                data: userData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// export const authConfirmTest = async (req, res, next) => {
//     try {
//         const errors = validationResult(req)

//         if (! errors.isEmpty()) {
//             return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
//         } else {
//             const { userId } = req.userData

//             res.status(200).json({
//                 status: true,
//                 message: 'Successfully authorized',
//                 data: userId,
//                 access_token: null
//             })
//         }
//     } catch (err) {
//         console.error(err)
//         return next(new HttpError("Oops! Process failed, please do contact admin", 500))
//     }
// }

import { validationResult } from "express-validator"
import Users from "../models/user.js"
import HttpError from "../middlewares/httpError.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import Touroperators from "../models/tourOperator.js"

export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new HttpError("Invalid data inputs passed, please check your data before retry!", 422))
        } else {
            const { email, password } = req.body

            const user = await Users.findOne({ email })
            const tourOperator = await Touroperators.findOne({ email })

            if( user ) {
                const isValidPassword = await bcrypt.compare(password, user.password)

                if (! isValidPassword) {
                    return next(new HttpError("Invalid credentials", 400))
                } else {

                    const token = jwt.sign({ userId: user._id, userEmail: user.email, role: "user" }, process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
                    )
                    res.status(200).json({
                        status: true,
                        message: 'Login successful',
                        data: {
                            _id: user._id,
                            role : "user"
                        },
                        access_token: token
                    })
                }
            } else if( tourOperator ) {
                const isValidPassword = await bcrypt.compare(password, tourOperator.password)

                if (! isValidPassword) {
                    return next(new HttpError("Invalid credentials", 400))
                } else {

                    const token = jwt.sign({ userId: tourOperator._id, userEmail: tourOperator.email, role: "Tour Operator" }, process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
                    )
                    res.status(200).json({
                        status: true,
                        message: 'Login successful',
                        data: {
                            _id: tourOperator._id,
                            role : "Tour Operator"
                        },
                        access_token: token
                    })
                }
            } else {
                return next(new HttpError("Invalid credentials", 400))
            }
        }
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}
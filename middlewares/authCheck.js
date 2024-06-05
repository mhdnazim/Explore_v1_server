import jwt from "jsonwebtoken"
import HttpError from "./httpError.js"
import Touroperators from "../models/tourOperator.js"
import Users from "../models/user.js"

const authCheck = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next()
    } else {
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return next(new HttpError('Authorization Failed!', 403))
            } else {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

                const validTourOperator = await Touroperators.findOne({ _id: decodedToken.userId })
                const validUser = await Users.findOne({ _id: decodedToken.userId })

                if (! validUser && ! validTourOperator) {
                    return next(new HttpError("Invalid User Credentials!", 400))
                } else  {
                    req.userData = { userId: decodedToken.userId, role: decodedToken.role }
                    next()
                }
            }
        } catch (error) {
            return next(new HttpError('Authentication failed', 403))
        }
    }
}

export default authCheck
import { validationResult } from "express-validator"
import HttpError from "../middlewares/httpError.js"
import Chats from "../models/chats.js"
import Users from "../models/user.js"
import { io } from "../app.js"

export const storeChat = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            console.log("error",errors)
            return next(new HttpError("Invalid data inputs passed, Please check your data before retry!", 422))
        } else {

            const { user, tour_operator, tour_and_activity, message } = req.body

            const { role, userId } = req.userData

            let newChat = ""

            if ( role === "user" ){
                newChat = new Chats({
                    user,
                    tour_operator,
                    tour_and_activity,
                    send_by: "user",
                    received_by: "Tour Operator",
                    message
                })
            } else if ( role === "Tour Operator" ){
                newChat = new Chats({
                    user,
                    tour_operator,
                    tour_and_activity,
                    send_by: "Tour Operator",
                    received_by: "user",
                    message
                })
            } 
                await newChat.save()

                io.emit('sendMessage', message)
                res.status(200).json({
                    status: true,
                    message: 'Chat added',
                    data: null,
                    access_token: null
                })
        }

    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const chatList = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { user, tour_operator, tour_and_activity  } = req.body

            const chatData = await Chats.find({ user, tour_operator, tour_and_activity })
            .populate({
                path: 'user',
                select: 'first_name last_name'
            })

            res.status(200).json({
                status: true,
                message: '',
                data: chatData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

export const chatListToOperator = async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (! errors.isEmpty()) {
            return next(new HttpError("Something went wrong...", 422))
        } else {
            const { tour_operator  } = req.body

            const chatData = await Chats.find({ tour_operator, send_by: "user" })
            .populate({
                path: 'user',
                select: 'first_name last_name'
            })

            res.status(200).json({
                status: true,
                message: '',
                data: chatData,
                access_token: null
            })
        }
        
    } catch (err) {
        console.error(err)
        return next(new HttpError("Oops! Process failed, please do contact admin", 500))
    }
}

// list users for operators 
export const listUsersByTourOperator = async (req, res, next) => {
    try {
        const { tour_operator_id } = req.body; 
        // Assuming tour_operator_id is passed as a URL parameter
        
        // Get distinct user IDs for the given tour operator
        const userIds = await Chats.distinct('user', { tour_operator: tour_operator_id });
        
        // Optionally populate user details
        const users = await Users.find({ _id: { $in: userIds } }).select('first_name last_name email'); 
        // Adjust fields as needed

        res.status(200).json({
            status: true,
            message: 'Users fetched successfully',
            data: users
        });
    } catch (err) {
        console.error(err);
        return next(new HttpError("Failed to fetch users, please contact admin", 500));
    }
};

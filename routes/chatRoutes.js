import { Router } from "express";
import authCheck from "../middlewares/authCheck.js";
import { addReviews, editReview, reviewList, viewReview } from "../controllers/reviewController.js";
import { check } from "express-validator";
import { chatList, chatListToOperator, listUsersByTourOperator, storeChat } from "../controllers/chatController.js";

const router = Router()

router.use(authCheck)

router.post('/add',
[
    check('user').not().isEmpty(),
    check('tour_operator').not().isEmpty(),
    check('message').not().isEmpty()
], storeChat)

router.post('/list', chatList)

router.post('/chatlist', chatListToOperator)

router.post('/users', listUsersByTourOperator)


export default router
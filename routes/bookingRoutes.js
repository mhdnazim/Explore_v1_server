import { Router } from "express";
import authCheck from "../middlewares/authCheck.js";
import { addBooking, approveBooking, bookingList, cancelBooking, completeBooking, completePayment, editBooking, paymentFailed } from "../controllers/bookingController.js";
import { check } from "express-validator";

const router = Router()

router.use(authCheck)

router.post('/add',
[
    check('user').not().isEmpty(),
    check('tour_operator').not().isEmpty(),
    check('tour_and_activity').not().isEmpty(),
    check('phone_number').not().isEmpty(),
    check('email').not().isEmpty(),
    check('date').not().isEmpty(),
    check('time').not().isEmpty(),
    check('no_of_persons').not().isEmpty(),
    check('pickup_point').not().isEmpty(),
    check('payment_mode').not().isEmpty(),
    check('total_cost').not().isEmpty()
], 
addBooking)

router.patch('/edit',
[
    check('_id').not().isEmpty(),
    check('phone_number').not().isEmpty(),
    check('email').not().isEmpty(),
    check('date').not().isEmpty(),
    check('time').not().isEmpty(),
    check('no_of_persons').not().isEmpty(),
    check('pickup_point').not().isEmpty(),
    check('payment_mode').not().isEmpty(),
    check('total_cost').not().isEmpty()
],  
editBooking)

router.post('/list', bookingList)

router.patch('/cancel',
[
    check('Booking_id').not().isEmpty()
], cancelBooking)

router.patch('/approve',
[
    check('Booking_id').not().isEmpty()
], 
approveBooking)

router.patch('/complete',
[
    check('Booking_id').not().isEmpty()
], completeBooking)

router.patch('/completepayment',
[
    check('Booking_id').not().isEmpty()
], completePayment)

router.patch('/paymentfailed',
[
    check('Booking_id').not().isEmpty()
], paymentFailed)

export default router
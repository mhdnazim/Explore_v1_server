import { Router } from "express";
import { findUserDetails, userRegister } from "../controllers/userController.js";
import { check } from "express-validator";
import {  authConfirmTest, login } from "../controllers/loginController.js";
import authCheck from "../middlewares/authCheck.js";

const router = Router()

router.post('/register',
[
    check('first_name').not().isEmpty(),
    check('last_name').not().isEmpty(),
    check('gender').not().isEmpty(),
    check('email').isEmail(),
    check('password').not().isEmpty(),
    check('date_of_birth').not().isEmpty(),
    check('phone_number').isLength({ min: 10, max: 10 })
], userRegister)

router.post('/login',
    [
        check('password').not().isEmpty(),
        check('email').isEmail()
    ], login
)

router.post('/find', findUserDetails)

router.use(authCheck)
router.post('/auth', authConfirmTest)

export default router

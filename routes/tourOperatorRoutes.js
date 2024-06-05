import { Router } from "express";
import { check } from "express-validator";
import { findOperators, operatorsList, tourOperatorRegister } from "../controllers/tourOperatorController.js";

const router = Router()

router.post('/register',
[
    check('name').not().isEmpty(),
    check('location').not().isEmpty(),
    check('email').isEmail(),
    check('password').not().isEmpty(),
    check('phone_number').isLength({ min: 10, max: 10 })
], tourOperatorRegister)

router.post('/list', operatorsList)

router.post('/find', findOperators)

export default router
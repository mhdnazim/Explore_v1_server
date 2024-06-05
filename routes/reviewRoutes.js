import { Router } from "express";
import authCheck from "../middlewares/authCheck.js";
import { addReviews, editReview, reviewList, viewReview } from "../controllers/reviewController.js";
import { check } from "express-validator";

const router = Router()

router.post('/list', reviewList)

router.use(authCheck)

router.post('/add',
[
    check('reviewer').not().isEmpty(),
    check('tour_operator').not().isEmpty(),
    check('tour_and_activity').not().isEmpty(),
    check('rating').not().isEmpty(),
    check('review_title').not().isEmpty(),
    check('review').not().isEmpty()
], addReviews)

router.patch('/edit',
[
    check('_id').not().isEmpty(),
    check('rating').not().isEmpty(),
    check('review_title').not().isEmpty(),
    check('review').not().isEmpty()
], editReview)

router.post('/view', viewReview)


export default router
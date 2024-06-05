import { Router } from "express";
import { check } from "express-validator";
import { addItinerary, addTourAndActivity, deleteItinerary, deleteTour, editItinerary, editTour, hideTour, myTours, tourList, viewTour } from "../controllers/tourActivityController.js";
import authCheck from "../middlewares/authCheck.js";
import multerConfig from "../middlewares/multer/uploadImage.js";

const router = Router()

router.post('/list', tourList)

router.post('/view', viewTour)

router.use(authCheck)

router.post('/mytours', myTours)

router.post('/add', multerConfig.single("highlight"),
[
    check('tour_operator').not().isEmpty(),
    check('title').not().isEmpty(),
    check('duration').not().isEmpty(),
    check('price').not().isEmpty(),
    check('availability').not().isEmpty(),
    check('activity_type').not().isEmpty()
], addTourAndActivity)

router.patch('/edit', multerConfig.single("highlight"),
[
    check('tour_operator').not().isEmpty(),
    check('title').not().isEmpty(),
    check('duration').not().isEmpty(),
    check('price').not().isEmpty(),
    check('availability').not().isEmpty(),
    check('activity_type').not().isEmpty()
]
, editTour)

router.patch('/additinerary',
[
    check('_id').not().isEmpty(),
    check('message').not().isEmpty()
], addItinerary)

router.patch('/edititinerary',
[
    check('_id').not().isEmpty(),
    check('step').not().isEmpty(),
    check('message').not().isEmpty()
], editItinerary)

router.patch('/deleteitinerary',
[
    check('_id').not().isEmpty()
], deleteItinerary)

router.patch('/delete',
[
    check('_id').not().isEmpty()
], deleteTour)

router.patch('/hide',
[
    check('_id').not().isEmpty()
], hideTour)

export default router
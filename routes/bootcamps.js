const express = require('express')

const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
//advancedResults middleware
const advancedResults = require('../middleware/advancedResults')


//include other Resources routers

const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const { protect, authrozie} = require('../middleware/auth')

const router = express.Router();

//Re-route into other resource router

router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post( protect, authrozie('publisher', 'admin'), createBootcamp)

router.route('/:id').get(getBootcamp).put(protect, authrozie('publisher', 'admin'), updateBootcamp).delete(protect, authrozie('publisher', 'admin'), deleteBootcamp)

router.route('/:id/photo').put(protect, authrozie('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router;
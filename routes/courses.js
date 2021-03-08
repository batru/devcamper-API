const express = require('express')

const { getCourses, getCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses')

const Course = require('../models/Course')
const  advancedResults = require('../middleware/advancedResults')

const { protect, authrozie} = require('../middleware/auth')

const router = express.Router({ mergeParams: true});

router.route('/').get( advancedResults( Course, {
    path: 'bootcamp',
    select: 'name description'
    }), getCourses)
.post(protect, addCourse)

router.route('/:id').get(getCourse).put(protect, authrozie('publisher', 'admin'), updateCourse).delete(protect, authrozie('publisher', 'admin'), deleteCourse)

module.exports = router
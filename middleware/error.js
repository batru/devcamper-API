const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {

    //console for the dev
    console.log(err)

    let error = { ...err}
    error.message = err.message

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found `
        error = new ErrorResponse(message, 404)
    }
    //Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = new ErrorResponse(message, 400)
    }

    //Mongoose Validation error
    if (err.name === 'ValidationError') {
        //extract the messages in the error array
        const message = Object.values(err.errors).map(val => val.message)
        error = new ErrorResponse(message, 400)
    }
    
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })

}

module.exports = errorHandler
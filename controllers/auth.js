const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async');

//@desc     Register User
//route     POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler( async (req, res, next) => {
    
    //get the fileds of the user
    const { name, email, password, role} = req.body

    //create the user
    const user = await User.create({
        name,
        email,
        password,
        role
    })

    sendTokenResponse(user, 200, res)
    
})

//@desc     Login User
//route     POST /api/v1/auth/login
//@access   Public
exports.login = asyncHandler( async (req, res, next) => {
    
    //get the fileds of the user
    const { email, password} = req.body

    //validate email and password

    if (!email || !password) {
        
        return next( new ErrorResponse(`Please provide an email and password`, 400))
    }

    //check for the user
    const user = await User.findOne({ email}).select('+password')

    if (!user) {
        return next( new ErrorResponse(`Invalid credentials`, 401))
    }

    //check if password match
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next( new ErrorResponse(`Invalid credentials`, 401))
    }
  sendTokenResponse(user, 200, res)
    
})


//@desc     Get logged in User
//route     GET /api/v1/auth/me
//@access   Private
exports.getMe = asyncHandler( async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user
    })
})


//@desc     Forgot password
//route     POST /api/v1/auth/forgotpassword
//@access   Private
exports.forgotPassword = asyncHandler( async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email})
    if (!user) {
      return next( new ErrorResponse(`User not found`, 400))  
    }
    //Get our resetToken
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false})
    
    //create a reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    const message = `make a put request to \n\n ${resetUrl}`
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        })
        res.status(200).json({ success:true, data: 'Email sent'})
    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false})
        return next( new ErrorResponse('Email could not be sent', 500))
    }
    
  
})

//@desc     Reset password
//route     PUT /api/v1/auth/resetpassword/:resettoken
//@access   Private
exports.resetPassword = asyncHandler( async (req, res, next) => {

    //get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now()}})
    if (!user) {
        return next(new ErrorResponse('Invalid Token', 400))
    }
    
    //set a new password
    user.password = req.body.password
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined
    await user.save()
    sendTokenResponse(user, 200, res)
  
})

//@desc     Update logged in user
//route     PUT /api/v1/auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler( async (req, res, next) => {
//fields to update
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new:true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: user
    })
})


//@desc     Update user password
//route     PUT /api/v1/auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler( async (req, res, next) => {
   
    //get the logged in user
    const user = await User.findById(req.user.id).select('+password')

    //match the current password with the password in db
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next( new ErrorResponse('Password is incorrect', 401))  
    }

    //set the new password for the user
    user.password = req.body.newPassword
    await user.save()
    sendTokenResponse(user, 200, res)
})

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //CREATE TOKEN
    const token = user.getSignedJwtToken()
   const options = {
       expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24*60*60*1000),
       httpOnly: true
   }

   if (process.env.NODE_ENV === 'production') {
       options.secure = true
   }

   //send back response
   res
   .status(statusCode)
   .cookie('token', token, options)
   .json({
       success: true,
       token
   })
}   

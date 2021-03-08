const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const UserSchema = new mongoose.Schema ({
    
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
           /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
           'Please add a valid email'
        ]
     },
     role: {
         type: String,
         enum: ['user', 'publisher'],
         default: 'user'
     },
     password: {
         type: String,
         required: [true, 'Please add a password'],
         minLength: 6,
         select: false
     },
     resetPasswordToken: String,
     resetPasswordExpire: String,
     createdAt: {
        type: Date,
        default: Date.now
     }
})

//Encrypt password using bcryptjs
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
     next()   
    }
    //generate a salt
    const salt = await bcrypt.genSalt(10)
    //hash the password field
    this.password = await bcrypt.hash(this.password, salt)    
})

//sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//get reset token and hash
UserSchema.methods.getResetPasswordToken = function () {
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex')
    //hash token and set to reset password token field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //expire the token after 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    //return the unhashed token
    return resetToken
}

module.exports = mongoose.model('User', UserSchema)

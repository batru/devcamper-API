const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const mongoSanitize = require('express-mongo-sanitize')
const cookieParser = require('cookie-parser')
const fileupload = require('express-fileupload')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')


//Load env variables
dotenv.config({ path: './config/config.env'})

//connect to Database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')
const app = express()

//Body parser
app.use(express.json());

//cookie parse
app.use(cookieParser())

//Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


//File upload
app.use(fileupload())

//sanitize
app.use(mongoSanitize())

app.use(express.static(path.join(__dirname, 'public')))

//mount routes
app.use('/api/v1/bootcamps', bootcamps)

app.use('/api/v1/courses', courses)

app.use('/api/v1/auth', auth)

app.use('/api/v1/users', users)

app.use('/api/v1/reviews', reviews)

//error handler middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT,  console.log(`Server  running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))
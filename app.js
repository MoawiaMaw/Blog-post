const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const path = require('path');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();


//initiating app
const app = express();

//bodyparser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//Security middlewares
//sanitize data (no SQL injection)
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent cross side scripting
app.use(xss());

//prevent http params pollution
app.use(hpp());

// enable CORS
app.use(cors());

//limit number of requests
const limiter = rateLimit({
    windowMs: 10 * 50 * 1000, //10mins
    max: 100
});
app.use(limiter);
//Security miidlwares

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//blog routes
const blogs = require('./routes/blogs');
app.use('/api/blogs', blogs);

//post routes
const posts = require('./routes/posts');
app.use('/api/posts', posts);

//auth routes
const auth = require('./routes/auth');
app.use('/api/auth', auth);

//comments routes
const comments = require('./routes/comments');
app.use('/api/comments', comments);

//reactions routes
const reactions = require('./routes/reactions');
app.use('/api/reactions', reactions);

//reviews routes
const reviews = require('./routes/reviews');
app.use('/api/reviews', reviews);


//error handler
app.use(errorHandler)



const PORT = process.env.PORT;
const server = app.listen(3000, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});

//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server
    server.close(() => {
        process.exit(1);
    });
})

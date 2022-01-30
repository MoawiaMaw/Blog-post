const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();


//initiating app
const app = express();

//bodyparser
app.use(express.json());

// enable CORS
app.use(cors());

//cookie parser
app.use(cookieParser());

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

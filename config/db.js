const mongoose = require('mongoose');

const connectDB = async () => {
    const con = await mongoose.connect('mongodb://localhost/ca-blogpost-app', {
        useNewUrlParser: true,
    });
    console.log(`mongoDB connected: ${con.connection.host}`);
}

module.exports = connectDB;
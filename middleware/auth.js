const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');


//protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies) {
        token = req.cookies.token
    }

    if (!token) {
        return next(new ErrorResponse('Unauthorized to access this route', 401));
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //create req.user
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(new ErrorResponse('Unauthorized to access this route', 401));
    }
});
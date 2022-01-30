const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


//@desc     Regiser new user 
//@route    POST /api/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    sendTokenResponse(201, user, res);
});

//@desc     Login user 
//@route    POST /api/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please enter email and password', 400));
    }

    //find the user using email 
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credintials', 400));
    }

    //Match entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credintials', 400));
    }

    sendTokenResponse(200, user, res);

});

//@desc     Log user out
//@route    GET /api/auth/logout
//@access   Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, data: {} });
});

//@desc     Get logged in user
//@route    GET /api/auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Update user details
//@route    PUT /api/auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true, runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Update user password
//@route    PUT /api/auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.user.id).select('+password');

    //Check if current password matches the entered current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Incorrect passsword', 400));
    }

    user.password = req.body.newPassword;
    await user.save()

    sendTokenResponse(200, user, res);
});

//@desc     Forgot password
//@route    post /api/auth/forgotpassword
//@access   Private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('user not found', 404));
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforSave: false });

    // create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested to reset the password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'reset password token',
            message
        });

        res.status(200).json({
            success: true, data: 'Email sent'
        });
    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforSave: false });
        return next(new ErrorResponse('Email could not be sent', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Reset password
//@route    PUT /api/v1/auth/resetpassword/:resettoken 
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('invalid token', 400));
    }

    //set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(200, user, res);
});


//get token from model, create cookie and send response
const sendTokenResponse = (statusCode, user, res) => {
    //create token
    const token = user.getSignedJwt();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    //return response
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
}
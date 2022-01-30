const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Blog = require('../models/Blog');

//@desc     Get all reviews
//@route    GET /api/reviews
//@route    GET /api/blogs/blogId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.blogId) {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return next(new ErrorResponse(`Blog with id ${req.params.blogId} not found`, 404));
        }

        const reviews = await Review.find({ blog: req.params.blogId }).populate({ path: 'blog', select: 'name' });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } else {
        res.status(200).json(res.advanceResult);
    }
});

//@desc     Get single review
//@route    GET /api/reviews/id
//@access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({ path: 'blog', select: 'name' });

    if (!review) {
        return next(new ErrorResponse(`Review with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({ success: true, data: review });
});

//@desc     Add a new review
//@route    POST /api/blogs/blogId/reviews
//@access   Private
exports.createReview = asyncHandler(async (req, res, next) => {
    req.body.blog = req.params.blogId;
    req.body.user = req.user.id;

    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
        return next(new ErrorResponse(`Blog with id ${req.params.blogId} not found`, 404));
    }

    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
});

//@desc     Update review
//@route    PUT /api/reviews/id
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`Review with id ${req.params.id} not found`, 404));
    }

    if (review.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Unauthorized to update this review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });
    res.status(201).json({ success: true, data: review });
});

//@desc     Delete review
//@route    DELETE /api/reviews/id
//@access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`Review with id ${req.params.id} not found`, 404));
    }

    if (review.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`Unauthorized to delete this review`, 401));
    }

    review.remove();
    res.status(201).json({ success: true, data: {} });
});
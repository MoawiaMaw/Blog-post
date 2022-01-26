const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Comment = require('../models/Comment');
const Post = require('../models/Post');



//@desc     Get all comments
//@route    GET /api/comments
//@route    GET /api/posts/:postId/comments
//@access   Public
exports.getComments = asyncHandler(async (req, res, next) => {
    if (req.params.postId) {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return next(new ErrorResponse(`Post with id ${req.params.postId} not found`, 404));
        }
        const comments = await Comment.find({ post: req.params.postId }).populate({ path: 'post', select: 'title user' });
        res.status(200).json({ success: true, count: comments.length, data: comments });
    } else {
        res.status(200).json(res.advanceResult);
    }
});

//@desc     Get single comment
//@route    GET /api/comments/:id
//access    Public
exports.getComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new ErrorResponse(`Comment with id ${req.params.id} not found`, 404));
    }
    res.status(200).json({ success: true, data: comment });
});

//@desc     Create new comment
//@route    POST /api/posts/:postId/comments
//@access   Private
exports.createComment = asyncHandler(async (req, res, next) => {
    // add post and user to body
    req.body.post = req.params.postId;
    req.body.user = req.user.id;

    const post = await Post.findById(req.params.postId);
    if (!post) {
        return next(new ErrorResponse(`Post with id ${req.params.postId} not found`, 404));
    }

    const comment = await Comment.create(req.body);
    res.status(201).json({ success: true, data: comment });
});

//@desc     Update comment
//@route    PUT /api/comments/:id
//@access   Private
exports.updateComment = asyncHandler(async (req, res, next) => {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ErrorResponse(`Comment wwith id ${req.params.id} not found`, 404));
    }

    //make sure user is comment owner 
    if (req.user.id !== comment.user.toString()) {
        return next(new ErrorResponse(`Unauthorized to update this comment`, 401));
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });
    res.status(201).json({ success: true, data: comment });
});

//@desc     Delete comment
//@route    DELETE /api/comments/:id
//@access   Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    const post = await Post.findById(comment.post);

    if (!comment) {
        return next(new ErrorResponse(`Comment with id ${req.params.id} not found`, 404));
    }

    //make sure user is comment owner or post owner
    if (comment.user.toString() !== req.user.id && req.user.id !== post.user.toString()) {
        return next(new ErrorResponse(`Unauthorized to delete this comment`));
    }

    comment.remove();
    res.status(200).json({ success: true, data: {} });
});

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');

//@desc     Get all reactions
//@route    GET /api/reactions
//@route    GET /api/posts/:postId/reactions
//@access   Public
exports.getReactions = asyncHandler(async (req, res, next) => {
    if (req.params.postId) {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return next(new ErrorResponse(`post with id ${req.params.postId} not found`, 404));
        }
        const reactions = await Reaction.find({ post: req.params.postId }).populate({ path: 'post', select: 'title user' });
        res.status(200).json({ success: true, count: reactions.length, data: reactions });
    } else {
        res.status(200).json(res.advanceResult);
    }
});

//@desc     Get single reaction
//@route    GET /api/reactions/id
//@access   Public
exports.getReaction = asyncHandler(async (req, res, next) => {
    const reaction = await Reaction.findById(req.params.id).populate({ path: 'post', select: 'title user' });
    if (!reaction) {
        return next(new ErrorResponse(`reaction with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({ success: true, data: reaction })
});

//@desc     Add new reaction
//@route    POST /api/posts/postId/reactions
//@access   Private
exports.createReaction = asyncHandler(async (req, res, next) => {
    req.body.post = req.params.postId;
    req.body.user = req.user.id;

    const post = await Post.findById(req.params.postId);
    if (!post) {
        return next(new ErrorResponse(`post with id ${req.params.postId} not found`, 404));
    }

    const reaction = await Reaction.create(req.body);
    res.status(201).json({ success: true, data: reaction });
});

//@desc     Update reaction
//@route    PUT /api/reaction/:id
//@access   Private
exports.updateReaction = asyncHandler(async (req, res, next) => {
    let reaction = await Reaction.findById(req.params.id);
    if (!reaction) {
        return next(new ErrorResponse(`reaction with id ${req.params.id} not found`, 404));
    }

    //make sure user is reaction owner 
    if (req.user.id !== reaction.user.toString()) {
        return next(new ErrorResponse(`Unauthorized to update this reaction`, 401));
    }

    reaction = await Reaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });
    res.status(201).json({ success: true, data: reaction });
});

//@desc     Delete reaction
//@route    DELETE /api/reactions/:id
//@access   Private
exports.deleteReaction = asyncHandler(async (req, res, next) => {
    const reaction = await Reaction.findById(req.params.id);
    if (!reaction) {
        return next(new ErrorResponse(`reaction with id ${req.params.id} not found`, 404));
    }

    //make sure user is reaction owner 
    if (req.user.id !== reaction.user.toString()) {
        return next(new ErrorResponse(`Unauthorized to update this reaction`, 401));
    }

    reaction.remove();
    res.status(200).json({ success: true, data: {} });
});
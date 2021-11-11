const Post = require('../models/Post');
const Blog = require('../models/Blog');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


//@desc     get all posts
//@route    GET /api/posts
//@route    GET /api/blogs/:blogId/posts
//@access   public
exports.getPosts = asyncHandler(async (req, res, next) => {
    if (req.params.blogId) {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return next(new ErrorResponse(`blog with id ${req.params.blogId} not found`, 404));
        }
        const posts = await Post.find({ blog: req.params.blogId }).populate('blog');
        res.status(200).json({ success: true, count: posts.length, data: posts });
    } else {
        res.status(200).json(res.advanceResult);
    }
});

//@desc     get single post
//@route    GET /api/post/:id
//@access   public
exports.getPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate('blog');
    if (!post) {
        return next(new ErrorResponse(`post with id ${req.params.id} not found`, 404));
    }
    res.status(200).json({ success: true, data: post });
});

//@desc     create new post
//@route    POST /api/blogs/:blogId/posts
//@access   private
exports.createPost = asyncHandler(async (req, res, next) => {
    req.body.blog = req.params.blogId;
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
        return next(new ErrorResponse(`blog with id ${req.params.blogId} not found`, 404));
    }
    const post = await Post.create(req.body);
    res.status(201).json({ success: true, data: post });
});

//@desc     update post
//@route    PUT /api/posts/:id
//@access   private
exports.updatePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!post) {
        return next(new ErrorResponse(`post with id ${req.params.id} not found`, 404));
    }
    res.status(200).json({ success: true, data: post });
});

//@desc     Delete post
//@route    DELETE /api/posts/:id
//@access   private
exports.deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorResponse(`post with id ${req.params.id} not found`, 404));
    }
    post.remove();
    res.status(200).json({ success: true, data: {} });
});
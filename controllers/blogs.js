const Blog = require('../models/Blog');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


//@desc     get all blogs
//@route    GET /api/blogs
//@access   public
exports.getBlogs = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceResult);
});

//@desc     get single blog
//@route    GET /api/blogs/:id
//@access   public
exports.getBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).populate({ path: 'posts', select: 'title' });
    if (!blog) {
        return next(new ErrorResponse(`blog with id ${req.params.id} not found`, 404));
    }
    res.status(200).json({ success: true, data: blog });
});

//@desc     create new blog
//@route    POST /api/blogs
//@access   private
exports.createBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
});

//@desc     update blog
//@route    PUT /api/blogs/:id
//@access   private
exports.updateBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!blog) {
        return next(new ErrorResponse(`blog with id ${req.params.id} not found`, 404));
    }
    res.status(200).json({ success: true, data: blog });
});

//@desc     Delete blog
//@route    DELETE /api/blogs/:id
//@access   private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new ErrorResponse(`blog with id ${req.params.id} not found`, 404));
    }
    blog.remove();
    res.status(200).json({ success: true, data: {} });
});
const express = require('express');
const {
    getBlog,
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogs');
const advanceResults = require('../middleware/advanceResults');
const Blog = require('../models/Blog');

//include other router resource
const postRouter = require('./posts');

const router = express.Router();

//re-route to other resource router
router.use('/:blogId/posts', postRouter);


router.route('/')
    .get(advanceResults(Blog, { path: 'posts', select: 'title' }), getBlogs)        //get all blog posts
    .post(createBlog)     //create blog post

router.route('/:id')
    .get(getBlog)           //get a single blog post
    .put(updateBlog)        // update blog
    .delete(deleteBlog);    //delete blog


module.exports = router;
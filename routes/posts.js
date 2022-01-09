const express = require('express');
const { getPosts, createPost, getPost, updatePost, deletePost } = require('../controllers/posts');
const advanceResults = require('../middleware/advanceResults');
const { protect } = require('../middleware/auth');

const Post = require('../models/Post');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Post, { path: 'blog', select: 'name' }), getPosts)
    .post(protect, createPost);

router.route('/:id')
    .get(getPost)
    .put(protect, updatePost)
    .delete(protect, deletePost);

module.exports = router;

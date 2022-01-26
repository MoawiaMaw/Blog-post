const express = require('express');
const {
    getComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
} = require('../controllers/comments');
const advanceResults = require('../middleware/advanceResults');
const { protect } = require('../middleware/auth');
const Comment = require('../models/Comment');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Comment, { path: 'post', select: 'title' }), getComments)
    .post(protect, createComment);

router.route('/:id')
    .get(getComment)
    .put(protect, updateComment)
    .delete(protect, deleteComment);


module.exports = router;


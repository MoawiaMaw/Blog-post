const express = require('express');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');
const advanceResults = require('../middleware/advanceResults');
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Review, { path: 'blog', select: 'title' }), getReviews)
    .post(protect, createReview);

router.route('/:id')
    .get(getReview)
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;
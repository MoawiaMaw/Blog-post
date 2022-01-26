const express = require('express');
const {
    getReactions,
    getReaction,
    createReaction,
    updateReaction,
    deleteReaction
} = require('../controllers/reactions');
const advanceResults = require('../middleware/advanceResults');
const { protect } = require('../middleware/auth');
const Reaction = require('../models/Reaction');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Reaction, { path: 'post', select: 'title user' }), getReactions)
    .post(protect, createReaction);
router.route('/:id')
    .get(getReaction)
    .put(protect, updateReaction)
    .delete(protect, deleteReaction);

module.exports = router;
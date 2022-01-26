const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
    reaction: {
        type: String,
        required: [true, 'please add a reaction'],
        enum: ['like', 'dislike', 'love', 'laugh', 'angry', 'sad']
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//prevent user from submitting more than one reaction per bootcamp
ReactionSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', ReactionSchema);
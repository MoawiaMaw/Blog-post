const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        maxlength: [100, "title can't be more than 100 characters"]
    },
    content: {
        type: String,
        required: [true, 'Please add a content']
    },
    blog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Blog',
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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

PostSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
    justOne: false
});

PostSchema.virtual('reactions', {
    ref: 'Reaction',
    localField: '_id',
    foreignField: 'post',
    justOne: false
});

module.exports = mongoose.model('Post', PostSchema);
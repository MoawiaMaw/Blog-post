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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    content: {
        type: String,
        required: [true, 'Please add a review content']
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating'],
        min: 1,
        max: 10
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
});

ReviewSchema.index({ blog: 1, user: 1 }, { unique: true });

//static method to get average rating for blog anf save
ReviewSchema.statics.getAverageRating = async function (blogId) {
    const obj = await this.aggregate([
        {
            $match: { blog: blogId }
        },
        {
            $group: {
                _id: '$blog',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(obj);

    try {
        await this.model('Blog').findByIdAndUpdate(blogId, {
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.log(err);
    }
};

//calculate average rating before saving a review
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.blog);
});

//calculate average rating after removing a review
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.blog);
});

module.exports = mongoose.model('Review', ReviewSchema);
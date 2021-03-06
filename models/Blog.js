const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please add a name to the blog'],
        unique: true,
        maxlength: [50, "name can't be more than 50 characters"]
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, "description can't be more than 500 characters"]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating cant be less than 1'],
        max: [10, 'Rating cant be more than 10']
    }
    ,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//cascade delete posts within blog when a blog deleted
BlogSchema.pre('remove', async function (next) {
    await this.model('Post').deleteMany({ blog: this._id });
    next();
});

//virtuals
BlogSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'blog',
    justOne: false
});


module.exports = mongoose.model('Blog', BlogSchema);
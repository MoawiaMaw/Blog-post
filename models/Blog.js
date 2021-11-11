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
    createdAt: {
        type: Date,
        default: Date.now
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
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    commentedOn: { type: Date, default: Date.now }
});

const likeSchema = new mongoose.Schema({
    userId: { type: String, required: true }
});

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    likes: [likeSchema],
    comments: [commentSchema]
});

module.exports = mongoose.model("Post", postSchema);
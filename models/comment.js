const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: String
    },
    text: String,
    date: {
        type: Date,
        default: Date.now
    },
    replies: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        date: {
            type: Date,
            default: Date.now
        },
        username: String,
        content: String,
        avatar: String
    }]
});

module.exports = mongoose.model("Comment", commentSchema);


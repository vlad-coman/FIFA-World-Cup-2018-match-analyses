  var express = require('express'),
      router = express.Router({
          mergeParams: true
      }),
      Preview = require("../models/preview"),
      Comment = require("../models/comment"),
      User = require("../models/user"),
      middleware = require("../middlewares");

//----------------------------COMMENTS-----------------------------------//      

// Comments New
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Preview.findById(req.params.id, (err, preview) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            res.render("comments/new", {preview: preview});
        }
    });

})

//Comments Create
router.post("/", middleware.isLoggedIn, (req, res) => {
    Preview.findById(req.params.id, (err, preview) => {
        if (err) {
            req.flash("Something went wrong");
            res.redirect("/previews");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong!")
                    res.redirect("back");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    comment.save();
                    preview.comments.push(comment);
                    preview.save();
                    req.flash("success", "Successfully added comment!")
                    setTimeout(() => {
                        res.redirect("/previews/" + preview._id);
                    }, 1000);
                }

            });
        };

    });
});

//Edit Route
router.get("/:commentId/edit", middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            res.render("comments/edit", {
                blog_id: req.params.id,
                comment: comment
            });
        }
    });
});

//Update Route
router.put("/:commentId", middleware.checkCommentOwnership, (req, res) => {
    req.body.comment.body = req.sanitize(req.body.comment.body);
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, comment) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            res.redirect("/previews/" + req.params.id);
        }
    });
});

// Destroy router
router.delete("/:commentId", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.commentId, (err) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/previews/" + req.params.id);
        }

    });
});

//-----------REPLIES OF COMMENTS-----------------------------------//

//  Create Route for Reply to Comment and for Reply to Reply
router.post("/:commentId/replies", (req, res) => {
    Comment.findById(req.params.commentId, function(err, comment) {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {

            var replyObj = {
                author: req.user._id,
                username: req.user.username,
                content: req.body.content,
                avatar: req.user.avatar
            }
            comment.replies.push(replyObj);
            comment.save();
            req.flash("success", "Reply Comment successfully added");
            res.redirect("/previews/" + req.params.id);
        }
    });
});

//Edit Reply Route
router.get("/:commentId/replies/:replyId/edit", (req, res) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            let foundReply = comment.replies.find(function(reply) {
                return reply.id === req.params.replyId
            });
            res.render("comments/editReplies", {
                previewId: req.params.id,
                comment: comment,
                reply: foundReply
            });
        }
    });
});

//Update Reply Route
router.put("/:commentId/replies/:replyId", (req, res) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            let foundReply = comment.replies.find(function(reply) {
                return reply.id === req.params.replyId
            });
            foundReply.content = req.body.reply;
            comment.save();
            req.flash("success", "Reply Comment successfully updated");
            res.redirect("/previews/" + req.params.id);
        }
    });
});

//Delete Reply Route
router.delete("/:commentId/replies/:replyId", (req, res) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        if (err) {
            req.flash("error", "Something went wrong!")
            res.redirect("back");
        } else {
            let foundReply = comment.replies.find(function(reply) {
                return reply.id === req.params.replyId
            });
            var removeIndex = comment.replies.map(function(item) {
                return item._id;
            }).indexOf(foundReply._id);
            comment.replies.splice(removeIndex, 1)
            comment.save();
            req.flash("success", "Reply Comment deleted");
            res.redirect("/previews/" + req.params.id);
        }
    });
});

  module.exports = router;
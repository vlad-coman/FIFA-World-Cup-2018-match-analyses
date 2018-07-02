var Preview = require("../models/preview");
var Comment = require("../models/comment");

middlewareObj = {};



middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login");
}

middlewareObj.isAdmin= (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.isAdmin){
            return next();
        } else {
            req.flash("error", "Permission denied! Your account does not have admin privilegies!");
            res.redirect("back");
        }
    } else {
        req.flash("error", "Permission denied! You must be logged in as Admin to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkBlogOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Preview.findById(req.params.id, (err, foundPreview) => {
            if (err) {
                req.flash("error")
                res.redirect("back", "Preview not found");
            } else {
                if (foundPreview.author.id.equals(req.user._id)) {
                    return next();
                } else {
                    req.flash("error", "You must be the creator of the article to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!")
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.commentId, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    return next();
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
}



module.exports = middlewareObj;
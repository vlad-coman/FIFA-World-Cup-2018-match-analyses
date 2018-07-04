var express = require('express'),
      router = express.Router(),
      Preview = require("../models/preview"),
      middleware = require("../middlewares"),
      multer = require('multer');

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({
    storage: storage,
    fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX ROUTE
router.get('/pages/:page', function(req, res, next) {
    var perPage = 4;
    var page = req.params.page || 1
    var noMatch = null;
    // search for a preview
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Preview
            .find({
                title: regex
            })
            .sort({
                created: -1
            })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function(err, previews) {
                Preview.count({
                    title: regex
                }).exec(function(err, count) {
                    if (err) return next(err)
                    if (previews.length < 1) {
                        noMatch = "No team match that query, please try again.";
                    }
                    res.render('previews/index', {
                        noMatch: noMatch,
                        previews: previews,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                });
            });
    // if no query search, show all previews
    } else {
        Preview
            .find({})
            .sort({
                created: -1
            })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec(function(err, previews) {
                Preview.count().exec(function(err, count) {
                    if (err) return next(err)
                    res.render('previews/index', {
                        noMatch: noMatch,
                        previews: previews,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    })
                })
            })
    }
})

//CREATE ROUTE - add new preview to DB
router.post("/", middleware.isLoggedIn, middleware.isAdmin, upload.single('image'), (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        req.body.preview.image = result.secure_url;
        req.body.preview.imageId = result.public_id;
        req.body.preview.author = {
            id: req.user._id,
            username: req.user.username
        }
        Preview.create(req.body.preview, (err, preview) => {
            if (err) {
                req.flash('error', "Something went wrong. Couldn't add the preview.");
                return res.redirect('back');
            } else {
                res.redirect("/previews/" + preview._id);
            }
        });
    });
});

//NEW - show form to create new preview
router.get("/new", middleware.isAdmin, function(req, res) {
    res.render("previews/new");
});

//SHOW ROUTE - shows more info about one preview
router.get("/:id", (req, res) => {
    Preview.findById(req.params.id).populate('comments').exec(function(err, foundPreview) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.render("previews/show", {
                preview: foundPreview
            });
        }
    });
});

//EDIT ROUTE
router.get("/:id/edit", middleware.checkBlogOwnership, (req, res) => {
    Preview.findById(req.params.id, function(err, foundPreview) {
        res.render("previews/edit", {
            preview: foundPreview
        });
    });
});

//UPDATE ROUTE
router.put("/:id", middleware.isAdmin, middleware.checkBlogOwnership, upload.single('image'), (req, res) => {
    // req.body.preview.body = req.sanitize(req.body.preview.body);
    Preview.findById(req.params.id, async function(err, preview) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(preview.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    preview.imageId = result.public_id;
                    preview.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            preview.title = req.body.preview.title;
            preview.body = req.body.preview.body;
            preview.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/previews/" + preview._id);
        }
    });
});

//DESROY ROUTE
router.delete("/:id", middleware.isAdmin, middleware.checkBlogOwnership, (req, res) => {
    Preview.findById(req.params.id, async function(err, preview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(preview.imageId);
            preview.remove();
            req.flash('success', 'Preview deleted successfully!');
            res.redirect('/previews/pages/1');
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

// regex function used in query search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
  
module.exports = router;
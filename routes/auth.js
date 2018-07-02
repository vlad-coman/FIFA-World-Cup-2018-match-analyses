  const express = require('express'),
        router = express.Router(),
        User = require("../models/user"),
        passport = require("passport"),
        async = require("async"),
        nodemailer = require("nodemailer"),
        crypto = require("crypto");

// show register form
router.get('/register', (req, res) => {
    res.render('register', {
        errors: null
    });
    req.session.errors = null;
});

// handle register logic
router.post("/register", (req, res) => {
    // register form validation
    req.check('firstName').isAlpha().withMessage('*First Name can contain only letters ');
    req.check('lastName').isAlpha().withMessage('*Last Name can contain only letters ')
    req.check('email', '*Invalid email address').isEmail();
    req.check('username', '*Username should be minimum 4 characters long').isLength({
        min: 4
    });
    req.check('password', '*Password should be minimum 8 characters long').isLength({
        min: 8
    });
    req.check('confirmPassword', "*The passwords doesn't match").equals(req.body.password);
    let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.render("register", {
            errors: req.session.errors
        });
    } else {
        // register user if validation is passed
        let newUser = new User({
            firstName: req.sanitize(req.body.firstName),
            lastName: req.sanitize(req.body.lastName),
            username: req.sanitize(req.body.username),
            email: req.sanitize(req.body.email),
            avatar: req.sanitize(req.body.avatar)
        });
        if (req.sanitize(req.body.adminCode) === process.env.ADMIN_CODE) {
            newUser.isAdmin = true;
        }
        User.register(newUser, req.body.password, (err, user) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Successfully registered, " + user.username)
                res.redirect("/previews/pages/1");
            });
        });

    }

});

//show login form
router.get("/login", (req, res) => {
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/previews/pages/1",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => {});

//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully logged out");
    res.redirect("/previews/pages/1");
});

//forgot route
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

//handling forgot route
router.post("/forgot", (req, res) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({
                email: req.body.email
            }, (err, user) => {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'worldcup.previews@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'worldcup.previews@gmail.com',
                subject: 'WorldCup Previews Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], (err) => {
        if (err) {
            req.flash('error', 'Something went wrong!');
            return res.redirect('/forgot');
        }
        res.redirect("/previews/pages/1");
    });

});

//reset password route
router.get('/reset/:token', function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            token: req.params.token
        });
    });
});

//reset password handling logic
router.post('/reset/:token', function(req, res) {
    async.waterfall([
        (done) => {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save((err) => {
                            req.logIn(user, (err) => {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        (user, done) => {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'worldcup.previews@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'worldcup.previews@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], (err) => {
        if (err) {
            req.flash('error', 'Something went wrong!');
            return res.redirect('back');
        }
        res.redirect('/previews/pages/1');
    });
});

//profile page 
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash("error", "Cannot find the user");
            res.redirect("back");
        } else {
            res.render("userProfile", {
                user: foundUser
            });
        }
    })
});

module.exports = router;
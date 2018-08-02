  const bodyParser       = require("body-parser"),
        methodOverride   = require("method-override"),
        expressSanitizer = require("express-sanitizer"),
        mongoose         = require("mongoose"),
        express          = require("express"),
        moment           = require('moment'),
        passport         = require("passport"),
        expressValidator = require("express-validator"),
        LocalStrategy    = require("passport-local"),
        app              = express(),
        Preview          = require("./models/preview"),
        User             = require("./models/user"),
        Comment          = require("./models/comment"),
        flash            = require("connect-flash");
        require('dotenv').config();

  // requiring routes
  const blogsRoutes = require("./routes/previews"),
        commentsRoutes = require("./routes/comments"),
        auth = require("./routes/auth"),
        landing = require("./routes/landing");

  
  mongoose.connect(process.env.DB_URL);
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(expressValidator());
  app.use(methodOverride("_method"));
  app.use(expressSanitizer());
  app.use(flash());

  // passport.js config
  app.use(require("express-session")({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  app.use(function(req, res, next) {
      res.locals.currentUser = req.user;
      res.locals.error = req.flash("error");
      res.locals.success = req.flash("success");
      app.locals.moment = moment;
      next();
  });

  app.use("/previews", blogsRoutes);
  app.use("/previews/:id/comments", commentsRoutes);
  app.use("/", auth);
  app.use("/", landing);

  //starting  server
  app.listen(process.env.PORT, () => {
      console.log("Server is running");
  })
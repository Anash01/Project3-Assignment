var express = require("express");

app = express();

var port = process.env.PORT || 3000

var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var passport = require("passport");

var LocalStrategy = require("passport-local");

var methodOverride = require("method-override");

var passportLocalMongoose = require("passport-local-mongoose");

var User = require("./models/user");

mongoose.connect("mongodb://localhost/assignment_app");


app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

var jobSchema = new mongoose.Schema({
    title: String,
    body: String,
    created: { type: Date, default: Date.now }
});

var Job = mongoose.model("Job", jobSchema);

app.use(require("express-session")({
    secret: "Once again rusty wins the cutest",
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
    next();
});

app.get("/", function(req, res) {
    res.render("landing");
});

app.get("/jobs", function(req, res) {
    Job.find({}, function(err, jobs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { jobs: jobs, currentUser: req.user });
        }
    });
});

app.get("/jobs/new", function(req, res) {
    res.render("new");
});


app.post("/jobs", function(req, res) {
    Job.create(req.body.job, function(err, newJob) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/jobs");
        }
    });
});

app.get("/jobs/:id", function(req, res) {
    Job.findById(req.params.id, function(err, foundjob) {
        if (err) {
            res.redirect("/jobs");
        } else {
            res.render("show", { job: foundjob });
        }
    });
});

app.get("/jobs/:id/edit", function(req, res) {
    Job.findById(req.params.id, function(err, foundjob) {
        if (err) {
            res.redirect("/jobs");
        } else {
            res.render("edit", { job: foundjob });
        }
    });
});

app.put("/jobs/:id", function(req, res) {
    Job.findByIdAndUpdate(req.params.id, req.body.job, function(err, updatedJob) {
        if (err) {
            res.redirect("/jobs");
        } else {
            res.redirect("/jobs/" + req.params.id);
        }
    });
});

app.delete("/jobs/:id", function(req, res) {
    Job.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/jobs");
        } else {
            res.redirect("/jobs");
        }
    });
});


app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/jobs");
        });
    });
});


app.get("/select", function(req, res) {
    res.render("select");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/jobs",
    failureRedirect: "/login"
}), function(req, res) {});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/jobs");
});


app.listen(process.env.PORT || 3000, function(req, res) {
    console.log("server is running");
});
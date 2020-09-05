const express = require("express"),
  app = express(),
  User = require("./models/User"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  taskSchema = require("./models/task"),
  localStrategy = require("passport-local");

mongoose.connect("mongodb://localhost/todoApp");

var Task = mongoose.model("Task", taskSchema);

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
  require("express-session")({
    secret: "mark",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////////////////////////
////=====routes=====////
////////////////////////
function isLogged(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

app.get("/login", (req, res) => {
  if (req.isAuthenticated()) res.redirect("/tasks");
  else res.render("login");
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) res.redirect("/tasks");
  else res.render("register");
});

app.get("/tasks", isLogged, (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) console.log(err);
    else res.render("index", { currentUser: req.user, tasks: user.posts });
  });
});

app.get("/tasks/new", isLogged, (req, res) => {
  res.render("new");
});

app.get("/tasks/:id", isLogged, (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    if (err) console.log(err);
    else res.render("show", { task: task });
  });
});

app.get("/tasks/:id/edit", isLogged, (req, res) => {
  Task.findById(req.params.id, (err, task) => {
    if (err) console.log(err);
    else res.render("edit", { task: task });
  });
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app.get("*", (req, res) => {
  res.redirect("/login");
});

app.post(
  "/register",
  (req, res, next) => {
    if (req.body.password === req.body.password2) return next();
    res.redirect("/register");
  },
  (req, res) => {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
          res.redirect("/tasks");
        });
      }
    );
  }
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/tasks",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.put("/tasks/:id", (req, res) => {
  Task.findByIdAndUpdate(req.params.id, req.body.task, (err, task) => {
    if (err) {
      console.log(err);
      res.redirect("/tasks");
    } else {
      console.log(task);
      res.redirect("/tasks/" + req.params.id);
    }
  });
});
app.delete("/tasks/:id", (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/tasks");
    } else {
      Task.findById(req.params.id, (err, task) => {
        var a = user.posts.indexOf(task);
        user.posts.splice(a, 1);
        user.save();
      });
      Task.findByIdAndDelete(req.params.id, (err) => {
        if (err) console.log(err);
        res.redirect("/tasks");
      });
    }
  });
});
/////////////Creating a new task//////////////
app.post("/tasks", (req, res) => {
  User.findById(req.user._id, (err, user) => {
    Task.create(req.body.task, (err, task) => {
      if (err) console.log(err);
      else {
        console.log(task);
        user.posts.push(task);
        user.save();
        res.redirect("/tasks");
      }
    });
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});

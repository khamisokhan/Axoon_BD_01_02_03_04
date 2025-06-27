const express = require("express");
const app = express();
const chat = require("./models/chat.js");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ExpressError = require("./ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn } = require("./middleware.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

main()
  .then(() => {
    console.log("mongoose is ready");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/ChatSystem");
}
const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  let { username, email, password } = req.body;
  const newUser = new User({ email, username });
  const registeredUser = await User.register(newUser, password);
  console.log(registeredUser);
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    res.redirect("/chats");
  }
);

// index route
app.get("/chats", async (req, res) => {
  try {
    let chats = await chat.find();
    res.render("index.ejs", { chats });
  } catch (err) {
    next(err);
  }
});

// new route
app.get("/chats/new", isLoggedIn, (req, res) => {
  res.render("new.ejs");
});

// create route
app.post(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let { from, msg, to } = req.body;
    let newChat = new chat({
      from: from,
      msg: msg,
      to: to,
      created_at: new Date(),
    });
    await newChat.save();
    req.flash("success", "New Chat is created!");
    res.redirect("/chats");
  })
);

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

// New - Show Route
app.get(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let foundChat = await chat.findById(id);
    if (!foundChat) {
      req.flash("error", "Chat you requested for dose not exist!");
      return res.redirect("/chats");
    } else {
      res.render("edit.ejs", { foundChat });
    }
  })
);

// edit route
app.get(
  "/chats/:id/edit",
  isLoggedIn,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let foundChat = await chat.findById(id);
    if (!foundChat) {
      req.flash("error", "Chat you requested for dose not exist!");
      res.redirect("/chats");
    } else {
      res.render("edit.ejs", { foundChat });
    }
  })
);

// update route
app.put(
  "/chats/:id",
  isLoggedIn,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { msg: newMsg } = req.body;
    await chat.findByIdAndUpdate(
      id,
      { msg: newMsg },
      { runValidators: true, new: true }
    );
    req.flash("success", "Chat is Edited!");
    res.redirect("/chats");
  })
);

// delete route
app.delete(
  "/chats/:id",
  isLoggedIn,
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await chat.findByIdAndDelete(id);
    req.flash("success", "Chat is Deleted!");
    res.redirect("/chats");
  })
);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

const handleValidationError = (err) => {
  // return err;
  return new ExpressError(400, err.message);
};

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    err = handleValidationError(err);
  }
  next(err);
});

// Error handling Middlemare
app.use((err, req, res, next) => {
  let { status = 500, message = "Some Error Occured" } = err;
  res.status(status).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("App is listening on Port 8080... ");
});

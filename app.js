const express = require("express");
const app = express();
const chat = require("./models/chat.js");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ExpressError = require("./ExpressError");

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
app.get("/chats/new", (req, res) => {
  res.render("new.ejs");
});

// create route
app.post("/chats", async (req, res, next) => {
  try {
    let { from, msg, to } = req.body;
    let newChat = new chat({
      from: from,
      msg: msg,
      to: to,
      created_at: new Date(),
    });
    await newChat.save();
    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

// New - Show Route
app.get(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let foundChat = await chat.findById(id);
    if (!foundChat) {
      next(new ExpressError(400, "chat not found"));
    }
    res.render("edit.ejs", { foundChat });
  })
);

// edit route
app.get(
  "/chats/:id/edit",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let foundChat = await chat.findById(id);
    res.render("edit.ejs", { foundChat });
  })
);

// update route
app.put(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { msg: newMsg } = req.body;
    await chat.findByIdAndUpdate(
      id,
      { msg: newMsg },
      { runValidators: true, new: true }
    );
    res.redirect("/chats");
  })
);

// delete route
app.delete(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    await chat.findByIdAndDelete(id);
    res.redirect("/chats");
  })
);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

const handleValidationError = (err) => {
  return err;
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

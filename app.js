const express=require("express");
const app= express();
const chat=require("./models/chat.js");
const path=require("path");
const methodOverride=require("method-override");
const mongoose=require("mongoose");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

main().then(()=>{
    console.log("mongoose is ready");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ChatSystem');
}

// index route
app.get("/chats", async(req, res)=>{
    let chats = await chat.find();
    res.render("index.ejs", {chats});
});

// new route 
app.get("/chats/new", (req, res)=>{
     res.render("new.ejs");
});

// create route 
app.post("/chats", (req, res)=>{
    let {from, msg, to}= req.body;
    let newChat= new chat({
        from: from,
        msg: msg,
        to: to,
        created_at: new Date(),
    });
    newChat.save().then((res)=>{
        console.log("chat is saved");
    }).catch((err)=>{
        console.log(err);
    })
    res.redirect("/chats");
});

// edit route 
app.get("/chats/:id/edit", async(req, res)=>{
    let {id}= req.params;
    let foundChat =await chat.findById(id);
    res.render("edit.ejs", {foundChat});
});

// update route 
app.put("/chats/:id", async(req, res)=>{
    let {id}= req.params;
    let {msg: newMsg}= req.body;
    let updateChat=await chat.findByIdAndUpdate(
        id,
        {msg: newMsg},
        {runValidators: true, new: true});
        res.redirect("/chats");

});

// delete route 
app.delete("/chats/:id", async(req, res)=>{
    let {id}= req.params;
    let deletedChat= await chat.findByIdAndDelete(id);
    res.redirect("/chats");
});

app.listen(8080, ()=>{
    console.log("App is listening on Port 8080... ");
});
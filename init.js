const mongoose=require("mongoose");
const chat=require("./models/chat.js");

main().then(()=>{
    console.log("mongoose is ready");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ChatSystem');
}

let allchats= [
    {
    from: "aftab",
    to: "khamiso khan",
    msg: "Bro, free this weekend?",
    created_at: new Date(), 
},
    {
    from: "junni",
    to: "dawood",
    msg: "I’ll send you my notes.",
    created_at: new Date(), 
},
    {
    from: "dawood",
    to: "junni",
    msg: "Lifesaver!",
    created_at: new Date(), 
},
    {
    from: "faisal",
    to: "aftab",
    msg: "kiya hall ha bhi",
    created_at: new Date(), 
},
    {
    from: "asif",
    to: "hamza",
    msg: "Yo, what’s up?",
    created_at: new Date(), 
},
    {
    from: "hamza",
    to: "asif",
    msg: "Nothing much, just chilling. You?",
    created_at: new Date(), 
}
];

chat.insertMany(allchats);
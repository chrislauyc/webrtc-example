require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const {v4:uuidV4} = require("uuid");

app.set("view engine","ejs");
app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.redirect(`${uuidV4()}`);
});

app.get("/:room",(req,res)=>{
    res.render("room",{roomId:req.params.room});
});

io.on("connection",socket=>{
    socket.on("join-room",(roomId,userId)=>{
        socket.join(roomId);
        console.log("user joined: "+ userId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on("disconnect",()=>{
            console.log("user disconnected: "+userId);
            socket.broadcast
            socket.broadcast.to(roomId).emit("user-disconnected", userId);
        });
    });
});
const port = process.env.NODE_ENV || 1234;

server.listen(port,()=>console.log(`server is listening at port ${port}`));
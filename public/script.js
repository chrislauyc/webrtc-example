const socket = io("/");
const myPeer = new Peer();
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream=>{
    console.log("getUserMedia");
    addVideoStream(myVideo,stream);

    myPeer.on("call",call=>{
        console.log("answering call");
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream",userVideoStream=>{
            addVideoStream(video,userVideoStream);
        })
    });

    socket.on("user-connected",userId=>{
        console.log("user connected");
        connectToNewUser(userId,stream);
    });


}).catch(e=>{
    console.log({e});
})

socket.on("user-disconnected",userId=>{
    console.log("user-disconnected");
    if(peers[userId]){
        peers[userId].close();
    }
});

myPeer.on("open",id=>{
    console.log("joining room");
    socket.emit("join-room",ROOM_ID,id);
});

function connectToNewUser(userId,stream){
    console.log("connectToNewUser");
    const call = myPeer.call(userId,stream);
    const video = document.createElement("video");
    call.on("stream",userVideoStream=>{
        addVideoStream(video,userVideoStream);
    });
    call.on("close",()=>{
        video.remove();
    });
    peers[userId] = call;
}


function addVideoStream(video, stream) {
    console.log("addVideoStream");
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(video);
  }


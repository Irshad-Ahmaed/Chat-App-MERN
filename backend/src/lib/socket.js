import {Server} from "socket.io";
import http from "http";
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true
    },
});

export function getReceiverSocketId(userId) { // return socket id of the user
    return userSocketMap[userId];
}

// Store Online Users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket)=> {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // io.emit() is used to send a events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=> {
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

export {io, app, server};
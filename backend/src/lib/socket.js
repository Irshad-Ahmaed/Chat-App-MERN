import { Server } from "socket.io";
import http from "http";
import express from 'express';
import OnlineAT from "../models/onlineAt.model.js";

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

io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    const isUserTimeExists = await OnlineAT.findOne({ userId: userId });
    if (isUserTimeExists) await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date() }, { new: true });

    const usersOnlineAt = await OnlineAT.find({ userId: { $ne: userId } });
    // Emit an event to notify clients about the disconnection 
    io.emit("userConnected", usersOnlineAt);

    // io.emit() is used to send a events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", async () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date() }, { new: true });
            delete userSocketMap[userId];

            const allUsersOnlineAt = await OnlineAT.find({});
            // // Emit an event to notify clients about the disconnection 
            io.emit("userDisconnected", { allUsersOnlineAt });

            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };
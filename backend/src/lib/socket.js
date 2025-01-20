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


// Function to update the online status of a user
async function updateUserOnlineStatus(userId, isOnline) {
    try {
        if (isOnline) {
            // Update the last online time to the current time and mark as online
            await OnlineAT.findOneAndUpdate(
                { userId },
                { lastOnlineAt: new Date(), isOnline: true },
                { upsert: true, new: true } // Create document if it doesn't exist
            );
            console.log("updateUserOnlineStatus: Online", userId)
        } else {
            // Mark the user as offline
            await OnlineAT.findOneAndUpdate(
                { userId },
                { isOnline: false, lastOnlineAt: new Date() },
                { new: true }
            );
            console.log("updateUserOnlineStatus: Offline", userId)
        }
    } catch (error) {
        console.error("Failed to update user online status:", error);
    }
}


io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (!userId) {
        console.error("No userId provided in handshake query.");
        return;
    }
    
    // Check if user is already connected
    if (userSocketMap[userId]) {
        console.log(`User ${userId} already connected. Replacing old connection.`);
        const oldSocketId = userSocketMap[userId];
        // Notify the old socket about the new connection
        io.to(oldSocketId).emit("duplicate_connection", "You have been disconnected due to a new connection.");
        io.sockets.sockets.get(oldSocketId)?.disconnect(); // Disconnect old socket
    }

    
        // If user is already connected, disconnect the previous socket
        // if (userSocketMap[userId]) { 
        //     io.to(userSocketMap[userId]).emit('duplicate_connection', 'You have been disconnected due to a new connection.'); 
        //     io.sockets.sockets.get(userSocketMap[userId])?.disconnect(); 
        // } 
    userSocketMap[userId] = socket.id;
    updateUserOnlineStatus(userId, true); // Mark as online
    

    const isUserTimeExists = await OnlineAT.findOne({ userId: userId });
    if (isUserTimeExists) await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date() }, { new: true });

    const usersOnlineAt = await OnlineAT.find({ isOnline: true });
    // Emit an event to notify clients about the disconnection 
    io.emit("userConnected", usersOnlineAt);

    // io.emit() is used to send a events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Listen for send_message event
    socket.on('send_message', async (data) => { 
        const { message, recipientId } = data;
        // Emit the message to the recipient 
        const recipientSocketId = getReceiverSocketId(recipientId); 
        if (recipientSocketId) { 
            io.to(recipientSocketId).emit('receive_message', data); 
        } 
        
        // Emit push notification for offline users (for mobile devices)
        if (!recipientSocketId) {
            io.emit('push_notification', {
                title: "New Message",
                body: message.text,
                recipientId
            });
        }
    });

    socket.on("disconnect", async () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            // await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date() }, { new: true });
            delete userSocketMap[userId];
            updateUserOnlineStatus(userId, false); // Mark as offline

            const allUsersOnlineAt = await OnlineAT.find({});
            const isLogout = socket.isLogout || false; // Track logout state
            // // Emit an event to notify clients about the disconnection 
            io.emit("userDisconnected", { allUsersOnlineAt, isLogout });

            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    // Handling Logout Event
    socket.on('logout', () => {
        socket.isLogout = true;
        socket.disconnect();
    });

    socket.on("rejoin", ({ userId }) => {
        console.log(`User rejoined: ${userId}`);
        userSocketMap[userId] = socket.id;
        updateUserOnlineStatus(userId, true); // Mark user as online again
        io.emit("userConnected", { userId });
    });
    
});

export { io, app, server };
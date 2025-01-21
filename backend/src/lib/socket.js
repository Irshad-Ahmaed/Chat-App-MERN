import { Server } from "socket.io";
import http from "http";
import express from 'express';
import OnlineAT from "../models/onlineAt.model.js";
import { getPushSubscriptionFromDB } from "./notications.js";
import webPush from 'web-push';

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

/**
 * Update the online status of a user
 * @param {string} userId - User ID
 * @param {boolean} isOnline - User online status
 */

const sendPushNotification = (subscription, message) => {
    const options = {
        TTL: 30, // Time-to-live in seconds
    };

    // Convert payload to string
    const payloadString = JSON.stringify({
        title: 'New Message',
        body: message.text,
        icon: '/notification-icon.png',
    });

    webPush
        .sendNotification(subscription, payloadString, options)
        .then((response) => {
            console.log('Push notification sent successfully:', response);
        })
        .catch((error) => {
            console.error('Error sending push notification:', error);
        });
};

/**
 * Get the recipient's socket ID
 * @param {string} userId - Recipient's user ID
 * @returns {string | undefined} - Socket ID of the recipient
 */

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
 
    userSocketMap[userId] = socket.id;

    const isUserTimeExists = await OnlineAT.findOne({ userId: userId });
    if (isUserTimeExists) await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date(), isOnline: true }, { new: true });

    const usersOnlineAt = await OnlineAT.find({ userId: { $ne: userId }});
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
        else{ // Find the user's push subscription and send a push notification
            const recipientPushSubscription = await getPushSubscriptionFromDB(recipientId);
        
            if (recipientPushSubscription) {
                // Send push notification to the offline user
                sendPushNotification(recipientPushSubscription, message);
            }
        }
    });

    // Handle socket disconnection
    socket.on("disconnect", async () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            await OnlineAT.findOneAndUpdate({ userId: userId }, { lastOnlineAt: new Date(), isOnline: false }, { new: true });
            delete userSocketMap[userId];

            const allUsersOnlineAt = await OnlineAT.find({});
            const isLogout = socket.isLogout || false; // Track logout state

            // // Emit an event to notify clients about the disconnection 
            io.emit("userDisconnected", { allUsersOnlineAt, isLogout });

            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };
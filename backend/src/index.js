import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import notificationRoutes from './routes/notifications.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './lib/socket.js';
import path from 'path';
import webPush from 'web-push';


dotenv.config()


const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
    'mailto:irsamd07@gmail.com', // Your contact email
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);


// const app = express(); // Removed because created on socket.js

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json()); // Extract the json data from the body, when we do req.body in controller
app.use(cookieParser()); // It's allow you to parse the cookies, in protectRoute.js

app.use(
    cors({
        origin: ['https://chat-app-mern-henna-nu.vercel.app/login', 'http://localhost:5173'],
        credentials: true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/message", messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res)=> {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    })
}

server.listen(PORT, ()=> {
    console.log("Server is running on port:" + PORT);
    connectDB();
})
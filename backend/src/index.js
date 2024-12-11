import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config()
const app = express();

const PORT = process.env.PORT;

app.use(express.json()); // Extract the json data from the body, when we do req.body in controller
app.use(cookieParser()); // It's allow you to parse the cookies, in protectRoute.js

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, ()=> {
    console.log("Server is running on port:" + PORT);
    connectDB()
})
import express from 'express'
import { protectRoute } from '../middlewares/protectRoute.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages); // This Id of the user which we are chatting with

router.post("/send/:id", protectRoute, sendMessage);

export default router;
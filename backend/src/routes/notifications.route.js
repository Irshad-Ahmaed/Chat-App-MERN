import express from 'express'
import { savePushSubscription } from '../controllers/notifications.controller.js';

const router = express.Router();

router.post("/save-push-subscription", savePushSubscription);

export default router;
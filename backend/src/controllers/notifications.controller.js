import PushSubscription from '../models/notificationSubs.model.js';

// Handle storing push subscription
export const savePushSubscription = async(req, res) => {
    try {
        const { userId, subscription: pushSub } = req.body;
        // Check if the user already has a subscription
        const existingSubscription = await PushSubscription.findOne({ userId });
        if (existingSubscription) {
            // If exists, update the subscription
            existingSubscription.subscription = pushSub;
            await existingSubscription.save();
        } else {
            // Otherwise, create a new subscription
            const newSubscription = new PushSubscription({
                userId,
                subscription: pushSub
            });
            await newSubscription.save();
        }
        res.status(200).json({ message: 'Subscription saved.' });
    } catch (error) {
        console.log("Error in savePushSubscription controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
    
};
import PushSubscription from "../models/notificationSubs.model.js";

// Get push subscription from DB by userId
export const getPushSubscriptionFromDB = async(userId) => {
    const subscription = await PushSubscription.findOne({ userId });
    if (subscription) {
        return subscription.subscription;
    } else {
        return null;
    }
}

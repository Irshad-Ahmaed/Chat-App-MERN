// models/PushSubscription.js
import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    subscription: {
        endpoint: { type: String, required: true },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    },
});

const PushSubscription = mongoose.model('PushSubscription', PushSubscriptionSchema);
export default PushSubscription;

import mongoose from "mongoose";

const onlineTimeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lastOnlineAt: {
        type: Date,
        default: Date.now,
    },
},
    { timestamps: true }
);

onlineTimeSchema.index({lastOnlineAt: 1}) // Ensure Indexing on lastOnlineAt
const OnlineAT = mongoose.model("OnlineAT", onlineTimeSchema);
export default OnlineAT;
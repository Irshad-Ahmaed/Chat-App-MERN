import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true,
            minLength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        connections: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        connectionRequests:[{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    {
        timestamps:  true
    }
)

const User = mongoose.model('User', userSchema);

export default User;
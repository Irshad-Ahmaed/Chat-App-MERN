import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// TODO: Improve Connection Request
// export const getConnectionRequest = async(req, res)=> {
//     try {
//         const userId = req.user._id;
//         const {id: userToChatId} = req.params;
//         const addingUserToChat = await User.findByIdAndUpdate(userId, {connections: userToChatId}, {new:true});

//         res.status(201).json(addingUserToChat);
//     } catch (error) {
//         console.log("Error in Connecting User Profile", error.message);
//         res.status(500).json({error: "Internal Server Error"}); 
//     }
// }

export const getMessages = async(req, res) => {
    try {
        const {id: userToChatId} = req.params; // Id of the user whom we want to chat
        const myId = req.user._id; // Id of the loggedIn user OR I who want to chat with someone

        const messages = await Message.find({
            $or: [{senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessage controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const sendMessage = async(req, res) => {
    const {text, image} = req.body;

    try {
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
            console.log(imageUrl);
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // realtime socket.io functionality
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}
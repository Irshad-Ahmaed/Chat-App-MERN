import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res)=> {
    const {email, fullName, password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password is too short"});
        }

        const user = await User.findOne({email: email});

        if(user) return res.status(400).json({message: "User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email,
            fullName: fullName,
            password: hashedPassword,
        });

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            console.log("saved");
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        }
        else{
            res.status(400).json({message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const login = async(req, res)=> {
    const {email, password} = req.body;

    try {
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const logout = (req, res)=> {
    try {
        res.cookie("token", "", {maxAge:0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const updateProfile = async(req, res)=>{
    const {profilePic} = req.body;

    try {
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message: "ProfilePic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true});

        res.status(201).json(updatedUser);
    } catch (error) {
        console.log("Error in Updating Profile", error.message);
        res.status(500).json({error: "Internal Server Error"});   
    }
}

export const checkAuth = (req, res) =>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async(req, res, next)=> {
    try {
        console.log('Cookies:', req.cookies);
        
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded");
        console.log(decoded);

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid token"})
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({message: "User is not found"});
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}
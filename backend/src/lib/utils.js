import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {  // It will take userId with JWT_SECRET and save them in cookies
        expiresIn: "7d"
    });

    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 *60 *1000,
        httpOnly: true, //prevent xSS attacks cross-site scripting attacks
        secure: process.env.Node_ENV !== "development",
    });
    
    return token;
}
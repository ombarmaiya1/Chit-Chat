import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

export const VerifyUser = (req, res, next) => {
    try {
        const token = req.cookies.token;    
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
         error.statusCode = 401;
        error.message = "Invalid or expired token";
        next(error);
    }
};

export const ValidateOTP = async (req, res, next) => {
    try {
        const otpToken = req.cookies.otpToken;
        if (!otpToken) {
            return res.status(401).json({ message: "OTP Expired" });
        }
        
        const decoded = jwt.verify(otpToken, JWT_SECRET);
        const email = decoded.email;
        req.user = { email };
        next();
    } catch (error) {
        error.statusCode = 401;
        error.message = "Invalid or expired OTP token";
        next(error);
    }
}
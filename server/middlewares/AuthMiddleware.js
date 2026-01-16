import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js'; 
import asyncHandler from 'express-async-handler';
import 'dotenv/config';

const protect = asyncHandler(async (req, res, next) => {
    let token;
    token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Authentication failed: User not found.'); 
            }

            next();

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            res.status(401); 
            throw new Error('Not authorized, token failed or expired.'); 
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token found.');
    }
});

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403);
        throw new Error("Access Forbidden: You must be an administrator."); 
    }
};

export { protect, adminOnly };
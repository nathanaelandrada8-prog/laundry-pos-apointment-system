import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; 
import asyncHandler from 'express-async-handler';
import 'dotenv/config';

const protect = asyncHandler(async (req, res, next) => {
    let token;
    // 1. Get token from cookies
    token = req.cookies.token;

    if (token) {
        try {
            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. Find user by ID from the token payload (excluding password hash)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Authentication failed: User not found.'); 
            }

            // 4. Proceed
            next();

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            // This error will be caught by the general error handler
            res.status(401); 
            throw new Error('Not authorized, token failed or expired.'); 
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token found.');
    }
});

const adminOnly = (req, res, next) => {
    // 'req.user' must be present from the preceding 'protect' middleware
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403);
        throw new Error("Access Forbidden: You must be an administrator."); 
    }
};

export { protect, adminOnly };
// server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming User model is one level up from middleware
import 'dotenv/config';

/**
 * @desc Protects routes: Verifies JWT from cookie and attaches user to req.
 * @returns {void}
 */
const protect = async (req, res, next) => {
    let token;

    // 1. Get token from the cookie
    // NOTE: This requires 'cookie-parser' middleware to be installed and used in index.js
    token = req.cookies.token;

    if (token) {
        try {
            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. Find user by ID from the token payload (excluding password hash)
            // The .select('-password') ensures we don't return the hash accidentally
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Token was valid but user was not found
                res.status(401).send(`
                    <script>
                        alert("Authentication failed: User not found. Redirecting to login.");
                        window.location.href = '/login';
                    </script>
                `);
                return;
            }

            // 4. Proceed to the next middleware or route handler
            next();

        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            // If token is invalid/expired
            res.status(401).send(`
                <script>
                    alert("Not authorized, token failed. Redirecting to login.");
                    window.location.href = '/login';
                </script>
            `);
        }
    } else {
        // If no token is present in the cookie
        res.status(401).send(`
            <script>
                alert("Not authorized, no token found. Redirecting to login.");
                window.location.href = '/login';
            </script>
        `);
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed
    } else {
        // Forbidden
        res.status(403).send(`
            <script>
                alert("Access Forbidden: You must be an administrator.");
                window.location.href = '/user/dashboard'; // Redirect non-admins to their dashboard
            </script>
        `);
    }
};

export { protect, adminOnly };
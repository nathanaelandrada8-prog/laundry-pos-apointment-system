import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; 

// Function to generate a JSON Web Token (JWT)
// This token will be stored in a cookie to manage the user session.
const generateToken = (id) => {
    // Requires JWT_SECRET to be defined in your server/.env file
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
        // HTTP 400: Bad Request
        return res.status(400).json({ success: false, message: 'Please enter all fields (name, email, password).' });
    }

    try {
        // 2. Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            // HTTP 409: Conflict
            return res.status(409).json({ success: false, message: 'User already exists with this email address.' });
        }

        // 3. Create the user (Password hashing is done via pre-save middleware in User model)
        const user = await User.create({
            name,
            email,
            password,
            role: 'customer', // Default role for new signups
        });

        // 4. Respond with success and user data/token
        if (user) {
            // Set JWT token in an HTTP-only cookie for secure session management
            res.cookie('token', generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            // HTTP 201: Created
            res.status(201).json({
                success: true,
                message: 'Registration successful. Redirecting to dashboard.',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                // Send the role to the frontend to determine redirect path
                redirectTo: '/user/dashboard', 
            });
        } else {
            // Should be caught by Mongoose validation errors, but as a fallback
            res.status(400).json({ success: false, message: 'Invalid user data received.' });
        }

    } catch (error) {
        // Handle Mongoose/Database errors
        console.error('Registration Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
    }

    try {
        // 2. Find the user, explicitly selecting the password hash
        const user = await User.findOne({ email }).select('+password');

        // 3. Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            
            // Determine redirect path based on user role
            const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

            // 4. Set JWT token in an HTTP-only cookie
            res.cookie('token', generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            // HTTP 200: OK
            res.status(200).json({
                success: true,
                message: 'Login successful. Redirecting...',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                redirectTo,
            });
        } else {
            // HTTP 401: Unauthorized
            res.status(401).json({ success: false, message: 'Invalid credentials (email or password incorrect).' });
        }

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};


/**
 * @desc Logout user / clear cookie
 * @route GET /api/auth/logout
 * @access Public (or protected if desired)
 */
const logoutUser = (req, res) => {
    // Clear the JWT cookie to end the session
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set expiration to a past date
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.', redirectTo: '/login' });
};


export { registerUser, loginUser, logoutUser };
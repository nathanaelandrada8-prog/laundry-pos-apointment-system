import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import 'dotenv/config'; 

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper function to set the cookie
const setCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
}

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { fname, lname, email, password } = req.body;

    if (!fname || !lname || !email || !password) {
        res.status(400); // HTTP 400: Bad Request
        throw new Error('Please enter all fields (name, email, password).');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(409); // HTTP 409: Conflict
        throw new Error('User already exists with this email address.');
    }

    // Password hashing is handled by pre-save middleware
    const user = await User.create({
        firstName: fname,
        lastName: lname,
        email,
        password,
        role: 'customer', 
    });

    if (user) {
        const fullName = `${user.firstName} ${user.lastName}`;
        const token = generateToken(user._id);
        setCookie(res, token);

        res.status(201).json({ // HTTP 201: Created
            success: true,
            message: 'Registration successful. Redirecting to dashboard.',
            data: {
                id: user._id,
                name: fullName,
                email: user.email,
                role: user.role,
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data received.');
    }
});

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter both email and password.');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {

        const fullName = `${user.firstName} ${user.lastName}`;
        const token = generateToken(user._id);

        setCookie(res, token);

        res.status(200).json({
            success: true,
            message: 'Login successful. Redirecting...',
            data: {
                id: user._id,
                name: fullName,
                email: user.email,
                role: user.role,
            }
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials (email or password incorrect).');
    }
});


/**
 * @desc Logout user / clear cookie
 * @route GET /api/auth/logout
 * @access Public
 */
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.', redirectTo: '/' });
});

export { registerUser, loginUser, logoutUser };
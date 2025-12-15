import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

/**
 * @desc    Render user profile page with data
 * @route   GET /user/profile
 * @access  Private
 */
const getUserProfilePage = asyncHandler(async (req, res) => {
    // req.user is populated by protect middleware
    const user = req.user; 
    
    // Fetch the full user document to ensure all profile fields (like address) are available
    const fullUser = await User.findById(user._id).select('-password'); // Exclude password

    if (fullUser) {
        // Render the page and pass the user object, which contains all profile data
        res.render('layout/userLayout', {
            contentPartial: '../user/profile',
            activePath: '../user/profile',
            userName: fullUser.name, // Virtual property 'name'
            user: fullUser, // Pass the full user object to the EJS template
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Update user profile via API
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { 
            firstName, 
            lastName, 
            phone, 
            streetAddress, 
            city, 
            postalCode, 
            addressNotes,
            profilePictureBase64 // <-- New field
        } = req.body;

        // Update personal info
        user.firstName = firstName ?? user.firstName;
        user.lastName = lastName ?? user.lastName;
        user.phone = phone ?? user.phone;
        
        // Update profile picture data
        user.profilePictureBase64 = profilePictureBase64 ?? user.profilePictureBase64;


        // Update nested address info
        if (user.address) {
            user.address.streetAddress = streetAddress ?? user.address.streetAddress;
            user.address.city = city ?? user.address.city;
            user.address.postalCode = postalCode ?? user.address.postalCode;
            user.address.addressNotes = addressNotes ?? user.address.addressNotes;

            // Important: Mark address as modified for Mongoose to save the nested changes
            user.markModified('address'); 
        } else {
             // Initialize address if it was null/undefined
             user.address = { streetAddress, city, postalCode, addressNotes };
        }
        
        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            profilePictureBase64: updatedUser.profilePictureBase64, // <-- Send back the new data
            message: 'Profile updated successfully',
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { 
    getUserProfilePage, 
    updateUserProfile 
};
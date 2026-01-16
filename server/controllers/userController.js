import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';

/**
 * @desc    Update user profile via API
 * @route   PUT /api/profile
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
            profilePictureBase64
        } = req.body;

        user.firstName = firstName ?? user.firstName;
        user.lastName = lastName ?? user.lastName;
        user.phone = phone ?? user.phone;
        
        user.profilePictureBase64 = profilePictureBase64 ?? user.profilePictureBase64;


        if (user.address) {
            user.address.streetAddress = streetAddress ?? user.address.streetAddress;
            user.address.city = city ?? user.address.city;
            user.address.postalCode = postalCode ?? user.address.postalCode;
            user.address.addressNotes = addressNotes ?? user.address.addressNotes;

            user.markModified('address'); 
        } else {
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
            profilePictureBase64: updatedUser.profilePictureBase64,
            message: 'Profile updated successfully',
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


/**
 * @desc    Get user profile via API
 * @route   GET /api/me
 * @access  Public
 */
const loadProfile = asyncHandler(async (req, res) => {
    res.status(200).json({
        user : {
            id: req.user._id,
            name: `${req.user.firstName} ${req.user.lastName}`,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
            phone: req.user.phone,
            address: req.user.address,
            profilePictureBase64: req.user.profilePictureBase64,
        }
    });
});

export { 
    updateUserProfile,
    loadProfile
};
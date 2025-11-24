import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    // User's full name, required for personalizing service.
    name: {
        type: String,
        required: [true, 'Please provide your full name.'],
        trim: true,
    },
    // Email is used as the unique identifier for login.
    email: {
        type: String,
        required: [true, 'Please provide an email address.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 
            'Please enter a valid email address.'
        ],
    },
    // The password hash. We never store the plain text password.
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: [6, 'Password must be at least 6 characters long.'],
        select: false, // Prevents the password hash from being returned in queries by default
    },
    // Designates if the user is a standard customer or an administrator.
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    // Address (optional initial field, can be expanded later)
    address: {
        type: String,
        trim: true,
        default: ''
    }
}, { 
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// --- MIDDLEWARE: Hash Password before saving ---
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; 
    }
    
    // Hash the password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- INSTANCE METHOD: Compare Passwords ---
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // When checking the password, we must ensure the 'password' field is selected
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
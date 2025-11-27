import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your full name.'],
        trim: true,
    },
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
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
        minlength: [6, 'Password must be at least 6 characters long.'],
        select: false, 
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    address: {
        type: String,
        trim: true,
        default: ''
    }
}, { 
    timestamps: true,
    collection: 'users' 
});

// --- MIDDLEWARE: Hash Password before saving ---
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --- INSTANCE METHOD: Compare Passwords ---
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // When checking the password, we must ensure the 'password' field is selected
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model using the filename convention
const User = mongoose.model('User', UserSchema);

export default User;
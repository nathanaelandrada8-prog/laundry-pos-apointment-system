import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const addressSchema = new mongoose.Schema({
    streetAddress: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    addressNotes: { type: String, trim: true, default: '' },
}, { _id: false });

const UserSchema = new mongoose.Schema({
    // Splitting the old 'name' field into dedicated first/last names
    firstName: {
        type: String,
        required: [true, 'Please provide your first name.'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Please provide your last name.'],
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
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    address: addressSchema, 
    profilePictureBase64: {
        type: String, 
        default: null,
    }
    
}, { 
    timestamps: true,
    collection: 'users',
    // Enable virtuals when converting to JSON/Object for full name access
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// --- VIRTUAL PROPERTY: Full Name (for display compatibility) ---
UserSchema.virtual('name').get(function() {
    // Return full name by combining first and last name
    return `${this.firstName} ${this.lastName}`;
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
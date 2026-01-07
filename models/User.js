import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: [true, 'A user must have a Firebase UID'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
    },
    preferences: {
        theme: {
            type: String,
            default: 'light',
        },
        language: {
            type: String,
            default: 'en',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

export default User;

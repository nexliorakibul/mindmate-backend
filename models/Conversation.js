import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat'
    },
    lastMessage: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
conversationSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

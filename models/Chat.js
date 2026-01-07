import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Chat message must belong to a user'],
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: [true, 'Chat message cannot be empty'],
    },
    sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Chat = mongoose.model('Chat', chatSchema);

// Create indexes for better query performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1 });

export default Chat;

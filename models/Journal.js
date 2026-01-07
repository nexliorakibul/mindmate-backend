import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Journal entry must belong to a user'],
        // Note: referencing firebaseUid manually as it's a string, not ObjectId
    },
    title: {
        type: String,
        required: [true, 'Journal entry must have a title'],
    },
    content: {
        type: String,
        required: [true, 'Journal entry must have content'],
    },
    emotion: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Journal = mongoose.model('Journal', journalSchema);

// Create indexes for better query performance
journalSchema.index({ userId: 1, date: -1 });
journalSchema.index({ userId: 1 });

export default Journal;

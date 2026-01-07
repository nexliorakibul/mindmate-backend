import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Mood entry must belong to a user'],
    },
    score: {
        type: Number,
        required: [true, 'Mood entry must have a score'],
        min: 1,
        max: 5,
    },
    mood: {
        type: String,
        required: [true, 'Mood entry must have a mood description'],
    },
    note: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Mood = mongoose.model('Mood', moodSchema);

// Create indexes for better query performance
moodSchema.index({ userId: 1, date: -1 });
moodSchema.index({ userId: 1 });

export default Mood;

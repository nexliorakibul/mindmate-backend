import Mood from '../models/Mood.js';
import AppError from '../utils/AppError.js';
import { validationResult } from 'express-validator';

// @desc    Get all mood entries for current user
// @route   GET /api/moods
// @access  Private
export const getMoods = async (req, res, next) => {
    try {
        const moods = await Mood.find({ userId: req.user.uid }).sort({ date: -1 });

        res.status(200).json({
            status: 'success',
            results: moods.length,
            data: {
                moods,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new mood entry
// @route   POST /api/moods
// @access  Private
export const createMood = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
    }

    try {
        const { score, mood, note, date } = req.body;

        const newMood = await Mood.create({
            userId: req.user.uid,
            score,
            mood,
            note,
            date: date || Date.now(),
        });

        res.status(201).json({
            status: 'success',
            data: {
                mood: newMood,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single mood entry
// @route   GET /api/moods/:id
// @access  Private
export const getMoodById = async (req, res, next) => {
    try {
        const mood = await Mood.findOne({ _id: req.params.id, userId: req.user.uid });

        if (!mood) {
            return next(new AppError('Mood entry not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                mood,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a mood entry
// @route   PUT /api/moods/:id
// @access  Private
export const updateMood = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
    }

    try {
        const mood = await Mood.findOne({ _id: req.params.id, userId: req.user.uid });

        if (!mood) {
            return next(new AppError('Mood entry not found', 404));
        }

        const { score, mood: moodLabel, note, date } = req.body;

        if (score !== undefined) mood.score = score;
        if (moodLabel !== undefined) mood.mood = moodLabel;
        if (note !== undefined) mood.note = note;
        if (date !== undefined) mood.date = date;

        await mood.save();

        res.status(200).json({
            status: 'success',
            data: {
                mood,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a mood entry
// @route   DELETE /api/moods/:id
// @access  Private
export const deleteMood = async (req, res, next) => {
    try {
        const mood = await Mood.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });

        if (!mood) {
            return next(new AppError('Mood entry not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

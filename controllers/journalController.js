import Journal from '../models/Journal.js';
import AppError from '../utils/AppError.js';
import { validationResult } from 'express-validator';

// @desc    Get all journals for current user
// @route   GET /api/journal
// @access  Private
export const getJournals = async (req, res, next) => {
    try {
        const journals = await Journal.find({ userId: req.user.uid }).sort({ date: -1 });

        res.status(200).json({
            status: 'success',
            results: journals.length,
            data: {
                journals,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new journal entry
// @route   POST /api/journal
// @access  Private
export const createJournal = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
    }

    try {
        const { title, content, emotion, date } = req.body;

        const newJournal = await Journal.create({
            userId: req.user.uid,
            title,
            content,
            emotion,
            date: date || Date.now(),
        });

        res.status(201).json({
            status: 'success',
            data: {
                journal: newJournal,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a journal entry
// @route   PUT /api/journal/:id
// @access  Private
export const updateJournal = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
    }

    try {
        const journal = await Journal.findOne({ _id: req.params.id, userId: req.user.uid });

        if (!journal) {
            return next(new AppError('Journal entry not found', 404));
        }

        const { title, content, emotion, date } = req.body;

        journal.title = title || journal.title;
        journal.content = content || journal.content;
        journal.emotion = emotion || journal.emotion;
        journal.date = date || journal.date;

        await journal.save();

        res.status(200).json({
            status: 'success',
            data: {
                journal,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
// @access  Private
export const deleteJournal = async (req, res, next) => {
    try {
        const journal = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });

        if (!journal) {
            return next(new AppError('Journal entry not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

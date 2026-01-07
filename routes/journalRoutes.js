import express from 'express';
import { body } from 'express-validator';
import {
    getJournals,
    createJournal,
    updateJournal,
    deleteJournal,
} from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getJournals)
    .post(
        [
            body('title', 'Title is required').not().isEmpty(),
            body('content', 'Content is required').not().isEmpty(),
        ],
        createJournal
    );

router
    .route('/:id')
    .put(
        [
            body('title', 'Title is required').optional().not().isEmpty(),
            body('content', 'Content is required').optional().not().isEmpty(),
        ],
        updateJournal
    )
    .delete(deleteJournal);

export default router;

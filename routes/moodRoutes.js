import express from 'express';
import { body } from 'express-validator';
import { getMoods, getMoodById, createMood, updateMood, deleteMood } from '../controllers/moodController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getMoods)
    .post(
        [
            body('score', 'Score must be a number between 1 and 5').isInt({ min: 1, max: 5 }),
            body('mood', 'Mood description is required').not().isEmpty(),
        ],
        createMood
    );

router
    .route('/:id')
    .get(getMoodById)
    .put(
        [
            body('score', 'Score must be a number between 1 and 5').optional().isInt({ min: 1, max: 5 }),
            body('mood', 'Mood description').optional().not().isEmpty(),
        ],
        updateMood
    )
    .delete(deleteMood);

export default router;

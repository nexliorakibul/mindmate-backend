import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimiter from './middleware/rateLimitMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import moodRoutes from './routes/moodRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting: 100 requests per 15 minutes per IP
app.use(rateLimiter(15 * 60 * 1000, 100));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.send('MindMate API is running');
});

// Error Handler
app.use(errorHandler);

export default app;

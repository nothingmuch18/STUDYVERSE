import dotenv from 'dotenv';
// Load environment variables BEFORE other imports to ensure they are available
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { taskRouter } from './routes/tasks.js';
import { sessionRouter } from './routes/sessions.js';
import { analyticsRouter } from './routes/analytics.js';
import { aiRouter } from './routes/ai.js';
import { habitsRouter } from './routes/habits.js';
import { goalsRouter } from './routes/goals.js';
import { communityRouter } from './routes/community.js';
import { paymentsRouter } from './routes/payments.js';
import { jobsRouter } from './routes/jobs.js';
import { gamificationRouter } from './routes/gamification.js';
import { quizRouter } from './routes/quiz.js';
import { errorHandler } from './middleware/errorHandler.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// Apply rate limiting in production or strict mode
if (process.env.NODE_ENV === 'production') {
    app.use('/api', limiter);
}

// Health check
const STARTUP_ID = Date.now().toString();
console.log(`🚀 Server starting with ID: ${STARTUP_ID}`);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.1 (Dynamic JWT Fix)',
        env: process.env.NODE_ENV,
        startupId: STARTUP_ID
    });
});

app.get('/api/debug-env', (req, res) => {
    res.json({
        hasJwtSecret: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length,
        secretStart: process.env.JWT_SECRET?.substring(0, 3)
    });
});

import { generateToken, verifyToken } from './lib/jwt.js';
app.get('/api/debug-jwt', (req, res) => {
    try {
        const payload = { userId: 'debug-id', email: 'debug@test.com' };
        const token = generateToken(payload);
        const verified = verifyToken(token);
        res.json({
            generated: !!token,
            same_process_verify: !!verified,
            payload_match: verified?.userId === payload.userId,
            token_sample: token.substring(0, 20) + '...'
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/sessions', sessionRouter); // Mount session router
app.use('/api/gamification', gamificationRouter);
app.use('/api/community', communityRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/career', jobsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter); // This line was present in original, but not in the provided snippet. Re-adding it.
app.use('/api/habits', habitsRouter); // This line was present in original, but not in the provided snippet. Re-adding it.
app.use('/api/goals', goalsRouter); // This line was present in original, but not in the provided snippet. Re-adding it.
app.use('/api/quizzes', quizRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 StudyOS API running on http://localhost:${PORT}`);
    console.log(`♻️  Server Restarted at ${new Date().toISOString()}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

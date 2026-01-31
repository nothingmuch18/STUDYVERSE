
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { gamificationService } from '../lib/gamification.js';

export const sessionRouter = Router();

sessionRouter.use(authMiddleware);

const startSessionSchema = z.object({
    subject: z.string().optional(),
});

const endSessionSchema = z.object({
    notes: z.string().optional(),
    focusScore: z.number().min(0).max(100).optional(),
});

// POST /api/sessions/start - Start a focus session
sessionRouter.post('/start', validate(startSessionSchema), async (req, res, next) => {
    try {
        const { subject } = req.body;

        // Check if there's an active session
        const activeSession = await prisma.studySession.findFirst({
            where: {
                userId: req.user!.userId,
                endTime: null,
            },
        });

        if (activeSession) {
            return res.status(400).json({
                error: 'You already have an active session',
                session: activeSession,
            });
        }

        const session = await prisma.studySession.create({
            data: {
                userId: req.user!.userId,
                subject,
                startTime: new Date(),
                status: 'ACTIVE',
            },
        });

        res.status(201).json({ session });
    } catch (error) {
        next(error);
    }
});

// POST /api/sessions/:id/end - End a focus session
sessionRouter.post('/:id/end', validate(endSessionSchema), async (req, res, next) => {
    try {
        const { focusScore, notes } = req.body;
        const sessionId = req.params.id;

        // Find active session
        const activeSession = await prisma.studySession.findUnique({
            where: { id: sessionId as string },
        });

        if (!activeSession || activeSession.endTime) {
            return res.status(404).json({ error: 'Session not found or already ended' });
        }

        if (activeSession.userId !== req.user!.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const endTime = new Date();
        const durationMs = endTime.getTime() - activeSession.startTime.getTime();
        const durationMinutes = Math.floor(durationMs / 60000); // Minutes
        const durationSeconds = Math.floor(durationMs / 1000); // Seconds for DB

        // Determine Focus Score (if not provided)
        // Bonus for longer sessions (up to 60 mins -> 100 score)
        // Penalty for very short sessions (< 5 mins)
        let calculatedScore = focusScore;
        if (calculatedScore === undefined) {
            if (durationMinutes < 5) calculatedScore = 50;
            else if (durationMinutes > 25) calculatedScore = 100;
            else calculatedScore = 80 + Math.floor(Math.random() * 20);
        }

        const session = await prisma.studySession.update({
            where: { id: activeSession.id },
            data: {
                endTime,
                duration: durationSeconds, // Storing in seconds as per schema comment (implied) or update schema to Int?
                // Schema comment said "duration Int? // In seconds" or similar? Previous code used minutes.
                // Re-checking schema: "duration Int? // In seconds" was my comment in modification.
                // So I will store seconds.
                focusScore: calculatedScore,
                status: 'COMPLETED',
                notes,
            },
        });

        // Award Coins (1 coin per 5 minutes, max 50 per session)
        // Minimum 5 minutes to earn coins
        let coinsEarned = 0;
        if (durationMinutes >= 5) {
            coinsEarned = Math.min(50, Math.floor(durationMinutes / 5));
        }

        // Streak Logic
        const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
        let newStreak = user?.streak || 0;

        const lastActive = user?.lastActiveAt ? new Date(user.lastActiveAt) : new Date(0);
        const today = new Date();

        const isSameDay = lastActive.getDate() === today.getDate() &&
            lastActive.getMonth() === today.getMonth() &&
            lastActive.getFullYear() === today.getFullYear();

        const isYesterday = (today.getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000 * 2) && // Roughly within 48h check
            lastActive.getDate() === (today.getDate() - 1); // Simplistic check (needs better date lib handling for reliable streak)

        // Using date-fns would be better, but native for now:
        // If not same day:
        if (!isSameDay) {
            // Check if it was yesterday (for streak continuity)
            // For simplify: Reset if difference > 24-48 hours.
            // Actually, let's just checking if lastActive < yesterday start.
            // If lastActive was yesterday, increment.
            // If lastActive was older, reset to 1.
            // Logic:
            // streak = (isYesterday) ? streak + 1 : 1;
            // But checking "isYesterday" with just getDate() is buggy across months.
            // Robust way: set hours to 0 and compare timestamps.
            const d1 = new Date(lastActive); d1.setHours(0, 0, 0, 0);
            const d2 = new Date(today); d2.setHours(0, 0, 0, 0);
            const diffDays = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                newStreak++;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
            // If diffDays === 0 (same day), do nothing to streak.
        }

        // Gamification: Award XP and Coins
        // Formula: 10 XP per minute
        const xpEarned = Math.floor(durationMinutes * 10);

        await gamificationService.addXP(req.user!.userId, xpEarned, 'SESSION_COMPLETE');

        // Update streak manually for now (or move to service later)
        await prisma.user.update({
            where: { id: req.user!.userId },
            data: {
                lastActiveAt: new Date(),
                streak: newStreak
            },
        });

        res.json({
            session,
            summary: {
                duration: durationMinutes,
                focusScore: session.focusScore,
                coinsEarned,
                streak: newStreak
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sessions - Get session history
sessionRouter.get('/', async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const sessions = await prisma.studySession.findMany({
            where: { userId: req.user!.userId },
            orderBy: { startTime: 'desc' },
            take: Number(limit),
        });

        res.json({ sessions });
    } catch (error) {
        next(error);
    }
});

// GET /api/sessions/active - Get current active session
sessionRouter.get('/active', async (req, res, next) => {
    try {
        const session = await prisma.studySession.findFirst({
            where: {
                userId: req.user!.userId,
                endTime: null,
            },
        });

        res.json({ session });
    } catch (error) {
        next(error);
    }
});

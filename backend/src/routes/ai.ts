
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { aiService } from '../lib/ai.js'; // Import the new service

export const aiRouter = Router();

aiRouter.use(authMiddleware);

// Schemas
const generatePlanSchema = z.object({
    goal: z.string().min(3).max(500),
    availableHours: z.number().min(0.5).max(24).optional(),
    subjects: z.array(z.string()).optional(),
});

// POST /api/ai/insights - Generate AI study insights
aiRouter.post('/insights', async (req, res, next) => {
    try {
        const userId = req.user!.userId;

        // Fetch user data for context
        const [user, recentTasks, recentSessions, analytics] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.task.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            prisma.studySession.findMany({
                where: { userId },
                orderBy: { startTime: 'desc' },
                take: 7,
            }),
            prisma.studySession.aggregate({
                where: { userId },
                _avg: { focusScore: true },
                _sum: { duration: true },
            }),
        ]);

        const pendingTasks = recentTasks.filter(t => t.status !== 'COMPLETED');
        const completedTasks = recentTasks.filter(t => t.status === 'COMPLETED');
        const avgFocusScore = analytics._avg.focusScore || 0;
        const totalStudyHours = Math.round((analytics._sum.duration || 0) / 3600 * 10) / 10;

        const context = {
            name: user?.name,
            streak: user?.streak,
            totalStudyHours,
            avgFocusScore,
            pendingTasksCount: pendingTasks.length,
            completedTasksRecent: completedTasks.length,
            recentSessions: recentSessions.map(s => ({ subject: s.subject, duration: s.duration, focus: s.focusScore }))
        };

        const parsed = await aiService.getInsights(context);

        // Store insights
        const insight = await prisma.aIInsight.create({
            data: {
                userId,
                type: 'RECOMMENDATION',
                title: 'Study Recommendation',
                content: parsed.recommendation || 'Keep up the great work!',
                metadata: JSON.stringify(parsed),
                viewed: false
            },
        });

        res.json({
            insight,
            recommendation: parsed.recommendation,
            productivityInsight: parsed.insight,
            motivation: parsed.motivation,
        });
    } catch (error) {
        console.error('AI Error:', error);
        res.json({
            recommendation: 'Focus on completing your pending tasks.',
            productivityInsight: 'Consistent study sessions are key.',
            motivation: 'Keep going!',
            error: 'AI service offline',
        });
    }
});

// POST /api/ai/study-plan
aiRouter.post('/study-plan', validate(generatePlanSchema), async (req, res, next) => {
    try {
        const { goal, availableHours = 2, subjects } = req.body;
        const userId = req.user!.userId;

        const tasks = await prisma.task.findMany({
            where: { userId, status: { not: 'COMPLETED' } },
            take: 10
        });

        const parsed = await aiService.generateStudyPlan(goal, availableHours, subjects || [], tasks);

        await prisma.aIInsight.create({
            data: {
                userId,
                type: 'PLAN',
                title: `Study Plan: ${goal}`,
                content: parsed.summary || 'A custom study plan.',
                metadata: JSON.stringify(parsed.plan),
            }
        });

        res.json({ plan: parsed.plan, summary: parsed.summary });

    } catch (error) {
        console.error("Study Plan Error:", error);
        res.status(500).json({ error: "Failed to generate study plan" });
    }
});

// POST /api/ai/chat
aiRouter.post('/chat', async (req, res, next) => {
    try {
        const { message, history } = req.body;
        const response = await aiService.chatWithCoach(history || [], message);
        res.json({ response });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'AI Coach is currently offline.' });
    }
});

// GET /api/ai/quick-tip (Kept static for speed/cost)
aiRouter.get('/quick-tip', async (req, res, next) => {
    try {
        const tips = [
            "Take a 5-minute break every 25 minutes to maintain focus.",
            "Review your notes within 24 hours to boost retention by 80%.",
            "Start with your hardest subject when your energy is highest.",
            "Use active recall: test yourself instead of just re-reading.",
            "Stay hydrated – your brain is 75% water!",
        ];
        const tip = tips[Math.floor(Math.random() * tips.length)];
        res.json({ tip });
    } catch (error) {
        next(error);
    }
});

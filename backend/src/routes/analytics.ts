
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

// GET /api/analytics/dashboard - Key metrics
analyticsRouter.get('/dashboard', async (req, res) => {
    const userId = req.user!.userId;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday

    // 1. Total Focus Time (All time)
    const totalFocus = await prisma.studySession.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { duration: true }
    });

    // 2. Weekly Focus Time
    const weeklyFocus = await prisma.studySession.aggregate({
        where: {
            userId,
            status: 'COMPLETED',
            startTime: { gte: startOfWeek }
        },
        _sum: { duration: true }
    });

    // 3. Focus Quality (Avg Focus Score)
    const quality = await prisma.studySession.aggregate({
        where: { userId, status: 'COMPLETED', focusScore: { not: null } },
        _avg: { focusScore: true }
    });

    res.json({
        totalMinutes: Math.round((totalFocus._sum.duration || 0) / 60),
        weeklyMinutes: Math.round((weeklyFocus._sum.duration || 0) / 60),
        avgFocusScore: Math.round(quality._avg.focusScore || 0)
    });
});

// GET /api/analytics/activity - For Heatmap (Last 365 days)
analyticsRouter.get('/activity', async (req, res) => {
    const userId = req.user!.userId;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sessions = await prisma.studySession.findMany({
        where: {
            userId,
            startTime: { gte: oneYearAgo },
            status: 'COMPLETED'
        },
        select: { startTime: true, duration: true }
    });

    // Group by date (YYYY-MM-DD)
    const activityMap: Record<string, number> = {};
    sessions.forEach(session => {
        const date = session.startTime.toISOString().split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + (session.duration || 0); // Seconds
    });

    // Convert to array format expected by frontend heatmap
    // Array<{ date: string, count: number, level: 0-4 }>
    const activity = Object.entries(activityMap).map(([date, seconds]) => {
        const minutes = Math.round(seconds / 60);
        let level = 0;
        if (minutes > 0) level = 1;
        if (minutes > 30) level = 2;
        if (minutes > 60) level = 3;
        if (minutes > 120) level = 4;

        return { date, count: minutes, level };
    });

    res.json(activity);
});

// GET /api/analytics/subjects - Pie chart data
analyticsRouter.get('/subjects', async (req, res) => {
    const userId = req.user!.userId;

    const sessions = await prisma.studySession.groupBy({
        by: ['subject'],
        where: { userId, status: 'COMPLETED', subject: { not: null } },
        _sum: { duration: true }
    });

    const data = sessions.map(s => ({
        name: s.subject,
        value: Math.round((s._sum.duration || 0) / 60)
    }));

    res.json(data);
});

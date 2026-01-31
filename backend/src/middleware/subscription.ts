
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const checkHabitLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { subscriptionTier: true }
        });

        if (user?.subscriptionTier === 'PRO') {
            return next();
        }

        // FREE TIER LIMIT: 3 Habits
        const habitCount = await prisma.habit.count({
            where: { userId: req.user.userId }
        });

        if (habitCount >= 3) {
            return res.status(403).json({
                error: 'Habit limit reached',
                code: 'LIMIT_REACHED',
                message: 'Free plan is limited to 3 habits. Please upgrade to Pro.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

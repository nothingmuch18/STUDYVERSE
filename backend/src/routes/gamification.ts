
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get Gamification Stats (Coins, Streak, Level)
router.get('/stats', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true, streak: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Simple Level Logic: Level = sqrt(coins)
        const level = Math.floor(Math.sqrt(user.coins));
        const progress = user.coins - (level * level); // progress to next level
        const nextLevelThreshold = ((level + 1) * (level + 1)) - (level * level);

        res.json({
            coins: user.coins,
            streak: user.streak,
            level,
            progress: Math.min(100, Math.floor((progress / nextLevelThreshold) * 100)),
            nextLevelCoins: (level + 1) * (level + 1)
        });
    } catch (error) {
        next(error);
    }
});

// Get Leaderboard (Top 10 users)
router.get('/leaderboard', authMiddleware, async (req, res, next) => {
    try {
        const topUsers = await prisma.user.findMany({
            orderBy: [
                { coins: 'desc' },
                { streak: 'desc' }
            ],
            take: 10,
            select: {
                id: true,
                name: true,
                coins: true,
                streak: true,
                avatarUrl: true
            }
        });

        res.json(topUsers);
    } catch (error) {
        next(error);
    }
});

// Get Badges
router.get('/badges', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user!.userId;

        // Fetch all available badges (Mocked for now as Badge table might be empty)
        // In real app, querying `prisma.badge.findMany()`
        // Checked schema: Badge model exists.

        const allBadges = await prisma.badge.findMany();
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true }
        });

        const earnedIds = new Set(userBadges.map(ub => ub.badgeId));

        const result = allBadges.map(b => ({
            ...b,
            earned: earnedIds.has(b.id)
        }));

        res.json({ all: result, earned: userBadges });
    } catch (error) {
        next(error);
    }
});

export const gamificationRouter = router;

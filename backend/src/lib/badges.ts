
import prisma from './prisma.js';

export const BADGES = {
    FIRST_TASK: {
        name: 'First Step',
        description: 'Complete your first task',
        icon: '🎯',
        criteria: 'Complete 1 task',
    },
    TASK_MASTER: {
        name: 'Task Master',
        description: 'Complete 100 tasks',
        icon: '⚔️',
        criteria: 'Complete 100 tasks',
    },
    FOCUS_NOVICE: {
        name: 'Focus Novice',
        description: 'Complete your first focus session',
        icon: '🧘',
        criteria: 'Complete 1 session',
    },
    DEEP_WORKER: {
        name: 'Deep Worker',
        description: 'Accumulate 10 hours of focus time',
        icon: '🧠',
        criteria: '10 hours of focus',
    },
    EARLY_BIRD: {
        name: 'Early Bird',
        description: 'Complete a session before 8 AM',
        icon: '🌅',
        criteria: 'Session end < 8 AM',
    },
    STREAK_WEEK: {
        name: 'Consistency King',
        description: 'Reach a 7 day streak',
        icon: '🔥',
        criteria: '7 day streak',
    }
};

export async function checkBadges(userId: string) {
    const newBadges: string[] = [];

    // Get user stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { badges: true }
    });

    if (!user) return [];

    const earnedBadgeIds = new Set(user.badges.map(b => b.badgeId));

    // Helper to award badge
    const award = async (badgeKey: keyof typeof BADGES) => {
        const badgeDef = BADGES[badgeKey];
        // Check if badge exists in DB, if not create it (idempotent init)
        let badge = await prisma.badge.findFirst({ where: { name: badgeDef.name } });
        if (!badge) {
            badge = await prisma.badge.create({ data: badgeDef });
        }

        if (!earnedBadgeIds.has(badge.id)) {
            await prisma.userBadge.create({
                data: { userId, badgeId: badge.id }
            });
            newBadges.push(badge.name);
        }
    };

    // Check Criteria independently

    // 1. Task Counts
    const taskCount = await prisma.task.count({ where: { userId, status: 'COMPLETED' } });
    if (taskCount >= 1) await award('FIRST_TASK');
    if (taskCount >= 100) await award('TASK_MASTER');

    // 2. Focus Stats
    const sessionStats = await prisma.studySession.aggregate({
        where: { userId, status: 'COMPLETED' },
        _count: true,
        _sum: { duration: true }
    });

    const sessionCount = sessionStats._count;
    const totalSeconds = sessionStats._sum.duration || 0;
    const totalHours = totalSeconds / 3600;

    if (sessionCount >= 1) await award('FOCUS_NOVICE');
    if (totalHours >= 10) await award('DEEP_WORKER');

    // 3. Streak
    if (user.streak >= 7) await award('STREAK_WEEK');

    // 4. Time based (Check last session)
    const lastSession = await prisma.studySession.findFirst({
        where: { userId, status: 'COMPLETED' },
        orderBy: { endTime: 'desc' }
    });

    if (lastSession && lastSession.endTime) {
        const hour = lastSession.endTime.getHours(); // Local time of server equivalent
        if (hour < 8 && hour >= 4) { // Between 4 AM and 8 AM
            await award('EARLY_BIRD');
        }
    }

    return newBadges;
}

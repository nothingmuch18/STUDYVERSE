
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkHabitLimit } from '../middleware/subscription.js';
import { z } from 'zod';

export const habitsRouter = Router();

habitsRouter.use(authMiddleware);

// Helper to parse dates
const parseHabit = (habit: any) => {
    try {
        if (typeof habit.completedDates === 'string') {
            habit.completedDates = JSON.parse(habit.completedDates);
        }
    } catch (e) {
        habit.completedDates = [];
    }
    return habit;
};

// GET /api/habits - List all habits
habitsRouter.get('/', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const habits = await prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const parsedHabits = habits.map(parseHabit);

        res.json({ habits: parsedHabits });
    } catch (error) {
        next(error);
    }
});

// POST /api/habits - Create a new habit
habitsRouter.post('/', checkHabitLimit, async (req, res, next) => {
    try {
        const { title, frequency } = req.body;
        const userId = req.user!.userId;

        const habit = await prisma.habit.create({
            data: {
                userId,
                title,
                frequency,
                completedDates: "[]", // Initialize as empty JSON array string
            },
        });

        res.status(201).json({ habit: parseHabit(habit) });
    } catch (error) {
        next(error);
    }
});

// POST /api/habits/:id/check - Toggle check-in for today (Simple toggle on for now)
habitsRouter.post('/:id/check', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const today = new Date();
        // Reset time to avoid timezone issues for simple date comparison
        const todayStr = today.toISOString().split('T')[0];

        const habit = await prisma.habit.findUnique({
            where: { id, userId },
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Parse existing dates
        let dates: string[] = [];
        try {
            dates = JSON.parse(habit.completedDates as unknown as string);
            if (!Array.isArray(dates)) dates = [];
        } catch (e) {
            dates = [];
        }

        // Check if already completed today (by date string YYYY-MM-DD)
        const isCompletedToday = dates.some(d => d.startsWith(todayStr));

        if (isCompletedToday) {
            // If already completed, do nothing or toggle off? For simplicity in MVP, let's keep it idempotent or just return success.
            // But UI might expect toggle. Let's return success with current state.
            return res.json({ habit: parseHabit(habit) });
        }

        // Add today
        dates.push(today.toISOString());

        // Simple streak calculation:
        // If last completion was yesterday, increment. If today is first, 1. If gap, reset (or keep logic simple: consecutive days).
        // For MVP, just increment streak. A robust cron job is needed for accurate daily resets.
        const newStreak = habit.streak + 1;

        const updatedHabit = await prisma.habit.update({
            where: { id },
            data: {
                completedDates: JSON.stringify(dates),
                streak: newStreak
            },
        });

        res.json({ habit: parseHabit(updatedHabit) });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/habits/:id
habitsRouter.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        await prisma.habit.delete({
            where: { id, userId },
        });

        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        next(error);
    }
});

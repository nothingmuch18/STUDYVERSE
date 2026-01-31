
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { z } from 'zod';

export const goalsRouter = Router();

goalsRouter.use(authMiddleware);

// GET /api/goals - List all goals
goalsRouter.get('/', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ goals });
    } catch (error) {
        next(error);
    }
});

// POST /api/goals - Create a goal
goalsRouter.post('/', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const schema = z.object({
            title: z.string().min(1),
            target: z.number().min(1),
            unit: z.string().default("hours"),
            period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("WEEKLY"),
        });

        const { title, target, unit, period } = schema.parse(req.body);

        const goal = await prisma.goal.create({
            data: {
                userId,
                title,
                target,
                current: 0,
                unit,
                period: period as any,
                status: 'ACTIVE',
            },
        });

        res.status(201).json({ goal });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/goals/:id - Update progress
goalsRouter.patch('/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const { current } = req.body;

        const goal = await prisma.goal.update({
            where: { id, userId },
            data: {
                current,
                status: current >= (await prisma.goal.findUnique({ where: { id } }))!.target ? 'COMPLETED' : 'ACTIVE',
            },
        });

        res.json({ goal });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/goals/:id - Delete goal
goalsRouter.delete('/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        await prisma.goal.delete({ where: { id, userId } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

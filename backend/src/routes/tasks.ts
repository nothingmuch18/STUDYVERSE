
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { checkBadges } from '../lib/badges.js';

export const taskRouter = Router();

// All routes require authentication
taskRouter.use(authMiddleware);

// Validation schemas
const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    subject: z.string().max(50).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
    duration: z.number().int().positive().optional(),
    dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// GET /api/tasks - List all tasks
taskRouter.get('/', async (req, res, next) => {
    try {
        const { status, priority, subject } = req.query;

        const tasks = await prisma.task.findMany({
            where: {
                userId: req.user!.userId,
                ...(status && { status: status as any }),
                ...(priority && { priority: priority as any }),
                ...(subject && { subject: subject as string }),
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        res.json({ tasks });
    } catch (error) {
        next(error);
    }
});

// GET /api/tasks/:id - Get single task
taskRouter.get('/:id', async (req, res, next) => {
    try {
        const task = await prisma.task.findFirst({
            where: {
                id: req.params.id,
                userId: req.user!.userId,
            },
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ task });
    } catch (error) {
        next(error);
    }
});

// POST /api/tasks - Create task
taskRouter.post('/', validate(createTaskSchema.extend({
    estimatedMinutes: z.number().optional(),
    isRecurring: z.boolean().optional(),
    recurrenceRule: z.string().optional(),
})), async (req, res, next) => {
    try {
        const data = req.body;

        const task = await prisma.task.create({
            data: {
                ...data,
                userId: req.user!.userId,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                priority: data.priority || 'MEDIUM',
            },
        });

        res.status(201).json({ task });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/tasks/:id - Update task & Handle Recurring
taskRouter.patch('/:id', validate(updateTaskSchema), async (req, res, next) => {
    try {
        const data = req.body;
        const taskId = req.params.id;
        const userId = req.user!.userId;

        const existing = await prisma.task.findUnique({
            where: { id: taskId as string },
        });

        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const isCompleting = data.status === 'COMPLETED' && existing.status !== 'COMPLETED';
        let coinsAwarded = 0;
        let nextTask = null;

        // 1. Award Coins if first time completed
        if (isCompleting && !existing.rewarded) {
            coinsAwarded = 10;
        }

        // 2. Handle Recurring Logic
        if (isCompleting && existing.isRecurring && existing.recurrenceRule && existing.dueDate) {
            const rule = existing.recurrenceRule.toUpperCase(); // e.g., "DAILY", "WEEKLY"
            let nextDate = new Date(existing.dueDate);

            // Simple MVP logic for recurrence
            if (rule === 'DAILY') {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (rule === 'WEEKLY') {
                nextDate.setDate(nextDate.getDate() + 7);
            }

            // Create the next instance
            nextTask = await prisma.task.create({
                data: {
                    title: existing.title,
                    description: existing.description,
                    subject: existing.subject,
                    priority: existing.priority,
                    estimatedMinutes: existing.estimatedMinutes,
                    userId: existing.userId,
                    status: 'PENDING',
                    dueDate: nextDate,
                    isRecurring: true,
                    recurrenceRule: existing.recurrenceRule,
                    parentTaskId: existing.parentTaskId || existing.id
                }
            });
        }

        const task = await prisma.task.update({
            where: { id: taskId as string },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                completedAt: isCompleting ? new Date() : undefined,
                rewarded: isCompleting ? true : undefined,
            },
        });

        if (coinsAwarded > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { coins: { increment: coinsAwarded } }
            });
        }

        const newBadges = await checkBadges(userId);

        res.json({ task, coinsAwarded, newBadges, nextTask });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/tasks/:id - Delete task
taskRouter.delete('/:id', async (req, res, next) => {
    try {
        // Check ownership
        const existing = await prisma.task.findFirst({
            where: { id: req.params.id, userId: req.user!.userId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await prisma.task.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
});

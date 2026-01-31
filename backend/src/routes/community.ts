
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

export const communityRouter = Router();

communityRouter.use(authMiddleware);

// GET /api/community/groups - List all groups (Mocked for now as we don't have a creation UI, but we'll auto-create one if empty)
communityRouter.get('/groups', async (req, res) => {
    // Auto-seed a general group if none exist
    const count = await prisma.studyGroup.count();
    if (count === 0) {
        await prisma.studyGroup.createMany({
            data: [
                { name: 'General Chat', description: 'Hangout and chill' },
                { name: 'React Developers', description: 'Discussing hooks and components' },
                { name: 'Pythonistas', description: 'Data science and scripts' },
            ]
        });
    }

    const groups = await prisma.studyGroup.findMany({
        include: {
            _count: {
                select: { members: true }
            }
        }
    });

    res.json(groups);
});

// GET /api/community/groups/:id/messages
communityRouter.get('/groups/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;

    const messages = await prisma.message.findMany({
        where: { groupId },
        orderBy: { createdAt: 'asc' }, // Oldest first for chat history
        take: 50,
        include: {
            sender: {
                select: { id: true, name: true, avatarUrl: true }
            }
        }
    });

    res.json(messages);
});

// POST /api/community/groups/:id/messages
const sendMessageSchema = z.object({
    content: z.string().min(1).max(1000)
});

communityRouter.post('/groups/:groupId/messages', validate(sendMessageSchema), async (req, res) => {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const message = await prisma.message.create({
        data: {
            content,
            groupId: groupId as string, // Ensure this matches schema connection
            senderId: userId
        },
        include: {
            sender: {
                select: { id: true, name: true, avatarUrl: true }
            }
        }
    });

    res.json(message);
});

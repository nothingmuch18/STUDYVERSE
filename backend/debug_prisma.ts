
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debug() {
    try {
        console.log('Connecting...');
        const userId = (await prisma.user.findFirst()).id;
        console.log('User ID:', userId);

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        console.log('Start of Day:', startOfDay);

        console.log('Running task.count...');
        const count = await prisma.task.count({
            where: {
                userId: userId,
                status: 'COMPLETED',
                completedAt: { gte: startOfDay },
            },
        });
        console.log('Count success:', count);

    } catch (error) {
        console.error('Debug Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debug();

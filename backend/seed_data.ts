
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'redlionhunter2025@gmail.com';
    console.log(`Seeding data for user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('User not found! Please create the user first.');
        return;
    }

    const userId = user.id;

    // 1. Subjects
    console.log('Seeding Subjects...');
    const subjects = await Promise.all([
        prisma.subject.create({ data: { userId, name: 'Machine Learning', color: '#10B981', totalHours: 12.5 } }),
        prisma.subject.create({ data: { userId, name: 'Web Development', color: '#3B82F6', totalHours: 34.2 } }),
        prisma.subject.create({ data: { userId, name: 'Data Structures', color: '#8B5CF6', totalHours: 8.0 } }),
    ]);

    // 2. Tasks
    console.log('Seeding Tasks...');
    await prisma.task.createMany({
        data: [
            { userId, title: 'Finish React Project', status: 'PENDING', priority: 'HIGH', subject: 'Web Development', dueDate: new Date(Date.now() + 86400000) },
            { userId, title: 'Review Neural Networks', status: 'PENDING', priority: 'MEDIUM', subject: 'Machine Learning', dueDate: new Date(Date.now() + 172800000) },
            { userId, title: 'Solve LeetCode Hards', status: 'COMPLETED', priority: 'HIGH', subject: 'Data Structures', completedAt: new Date(), rewarded: true },
        ],
    });

    // 3. Habits
    console.log('Seeding Habits...');
    await prisma.habit.createMany({
        data: [
            { userId, title: 'Deep Work (4h)', frequency: 5, streak: 3 },
            { userId, title: 'Read Research Papers', frequency: 3, streak: 1 },
            { userId, title: 'Gym / Meditation', frequency: 7, streak: 12 },
        ],
    });

    // 4. Study Sessions (History)
    console.log('Seeding Study Sessions...');
    const past = new Date();
    past.setDate(past.getDate() - 1);
    await prisma.studySession.create({
        data: {
            userId,
            subject: 'Web Development',
            startTime: past,
            endTime: new Date(past.getTime() + 3600000), // 1 hour
            duration: 3600,
            focusScore: 95,
            status: 'COMPLETED',
            notes: 'Focused on component architecture.',
        },
    });

    // 5. Goals
    console.log('Seeding Goals...');
    await prisma.goal.createMany({
        data: [
            { userId, title: 'Master TypeScript', target: 50, current: 20, unit: 'hours', period: 'MONTHLY' },
            { userId, title: 'Complete Course', target: 100, current: 45, unit: 'percent', period: 'WEEKLY' },
        ],
    });

    // 6. AI Insights
    console.log('Seeding AI Insights...');
    await prisma.aIInsight.create({
        data: {
            userId,
            type: 'productivity',
            title: 'Peak Focus Time',
            content: 'You seem to be most productive between 10 AM and 2 PM. Schedule your hardest tasks then!',
            viewed: false,
        },
    });

    console.log('Seed COMPLETED! 🚀');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

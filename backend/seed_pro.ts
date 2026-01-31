
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'redlionhunter2025@gmail.com';
    console.log(`Seeding PRO data for user: ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error('User not found!');
        return;
    }
    const userId = user.id;

    // 1. More Subjects
    console.log('Adding Subjects...');
    await prisma.subject.createMany({
        data: [
            { userId, name: 'Cloud Computing', color: '#0EA5E9', totalHours: 15.0 },
            { userId, name: 'System Design', color: '#F59E0B', totalHours: 22.5 },
            { userId, name: 'Cybersecurity', color: '#EF4444', totalHours: 5.0 },
        ],
        skipDuplicates: true, // Prisma 5+ might support this or fail if not supported. SQLite usually needs care.
    }).catch(e => console.warn("Subject seeding skipped/error:", e.message));

    // 2. Pro Tasks
    console.log('Adding Pro Tasks...');
    const tasks = [];
    for (let i = 1; i <= 10; i++) {
        tasks.push({
            userId,
            title: `Chapter ${i} Review`,
            status: i < 6 ? 'COMPLETED' : 'PENDING',
            priority: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
            subject: 'System Design',
            dueDate: new Date(Date.now() + i * 86400000),
            completedAt: i < 6 ? new Date(Date.now() - (10 - i) * 86400000) : undefined
        });
    }
    await prisma.task.createMany({ data: tasks }).catch(e => console.warn("Tasks seeding error:", e.message));

    // 3. Study History
    console.log('Adding History...');
    const sessions = [];
    for (let i = 0; i < 30; i++) {
        if (Math.random() > 0.3) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const duration = Math.floor(Math.random() * 7200) + 1800;

            sessions.push({
                userId,
                subject: ['Web Development', 'System Design', 'Machine Learning'][Math.floor(Math.random() * 3)],
                startTime: date,
                endTime: new Date(date.getTime() + duration * 1000),
                duration: duration,
                focusScore: Math.floor(Math.random() * 30) + 70,
                status: 'COMPLETED',
            });
        }
    }
    await prisma.studySession.createMany({ data: sessions }).catch(e => console.warn("Session seeding error:", e.message));

    // 4. Update Habits
    await prisma.habit.updateMany({
        where: { userId },
        data: { streak: { increment: 5 } }
    }).catch(e => console.warn("Habit update error:", e.message));

    // 5. Community Groups & Posts
    console.log('Adding Community Data...');
    try {
        const groups = [
            { name: 'Web Development Pros', description: 'React, Node.js, and everything web.', isPublic: true },
            { name: 'System Design Interview', description: 'Preparing for big tech interviews.', isPublic: true },
            { name: 'Machine Learning Lab', description: 'Discussing the latest in AI/ML.', isPublic: true },
            { name: 'Productivity Hackers', description: 'Optimizing workflows and habits.', isPublic: true },
        ];

        for (const g of groups) {
            const existing = await prisma.group.findFirst({ where: { name: g.name } });
            if (!existing) {
                console.log(`Creating group: ${g.name}`);
                const group = await prisma.group.create({
                    data: {
                        name: g.name,
                        description: g.description,
                        isPublic: g.isPublic,
                        members: { create: { userId, role: 'ADMIN' } }
                    }
                });

                await prisma.post.createMany({
                    data: [
                        { groupId: group.id, authorId: userId, content: `Welcome to the ${g.name} group! Introduce yourselves here.`, likes: 5 },
                        { groupId: group.id, authorId: userId, content: 'Anyone working on a cool project this weekend?', likes: 2 }
                    ]
                });
            }
        }
    } catch (e) {
        console.error("Error seeding Community:", e);
    }

    // 6. Career Jobs
    console.log('Adding Jobs...');
    try {
        const jobs = [
            { title: 'Frontend Engineer Intern', company: 'TechNova', location: 'Remote', type: 'INTERNSHIP', description: 'Build beautiful UIs with React and Tailwind.', requirements: '["React", "TypeScript", "CSS"]' },
            { title: 'Junior Backend Developer', company: 'DataFlow', location: 'New York, NY', type: 'FULL_TIME', description: 'Scale our API infrastructure.', requirements: '["Node.js", "PostgreSQL", "Redis"]' },
            { title: 'UX Designer', company: 'Creative Studio', location: 'London, UK', type: 'FREELANCE', description: 'Design intuitive user experiences for mobile apps.', requirements: '["Figma", "User Research", "Prototyping"]' },
            { title: 'AI Research Intern', company: 'OpenFuture', location: 'San Francisco, CA', type: 'INTERNSHIP', description: 'Work on cutting-edge LLMs.', requirements: '["Python", "PyTorch", "Math"]' },
        ];
        await prisma.job.createMany({ data: jobs });
    } catch (e) {
        console.error("Error seeding Jobs:", e);
    }

    // 7. Gamification: Badges & Mock Users
    console.log('Adding Gamification Data...');
    try {
        const badges = [
            { name: 'Early Bird', description: 'Complete a task before 8 AM', icon: 'zap', criteria: 'task_before_8am' },
            { name: 'Task Master', description: 'Complete 100 tasks', icon: 'trophy', criteria: '100_tasks' },
            { name: 'Study Sage', description: 'Log 50 hours of focus', icon: 'book', criteria: '50_hours' },
            { name: 'Socialite', description: 'Join 3 study groups', icon: 'users', criteria: '3_groups' },
            { name: 'Streak 7', description: '7 day habit streak', icon: 'flame', criteria: '7_day_streak' },
        ];

        for (const b of badges) {
            const existing = await prisma.badge.findFirst({ where: { name: b.name } });
            let badgeId = existing?.id;
            if (!existing) {
                console.log(`Creating badge: ${b.name}`);
                const newBadge = await prisma.badge.create({ data: b });
                badgeId = newBadge.id;
            } else {
                badgeId = existing.id;
            }

            if (badgeId && ['Early Bird', 'Task Master'].includes(b.name)) {
                // Simplified user badge creation to avoid composite unique issues with findUnique
                const count = await prisma.userBadge.count({
                    where: { userId, badgeId }
                });
                if (count === 0) {
                    await prisma.userBadge.create({ data: { userId, badgeId } });
                }
            }
        }
    } catch (e) {
        console.error("Error seeding Gamification:", e);
    }

    // Mock Users
    try {
        const mockUsers = [
            { name: 'Alex Chen', email: 'alex@example.com', coins: 1450, streak: 12 },
            { name: 'Sarah Jones', email: 'sarah@example.com', coins: 1320, streak: 8 },
            { name: 'Mike Ross', email: 'mike@example.com', coins: 980, streak: 15 },
            { name: 'Emma Watson', email: 'emma@example.com', coins: 2100, streak: 25 },
            { name: 'David Lee', email: 'david@example.com', coins: 850, streak: 5 },
        ];

        for (const u of mockUsers) {
            const exists = await prisma.user.findUnique({ where: { email: u.email } });
            if (!exists) {
                console.log(`Creating mock user: ${u.name}`);
                await prisma.user.create({
                    data: {
                        ...u,
                        password: 'password123',
                        role: 'STUDENT'
                    }
                });
            }
        }
    } catch (e) {
        console.error("Error seeding Mock Users:", e);
    }

    console.log('Phase 2 Seed COMPLETED! 🚀');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection...');
    const count = await prisma.user.count();
    console.log(`User count: ${count}`);

    console.log('Testing Group Creation...');
    try {
        const g = await prisma.group.create({
            data: {
                name: 'Test Group ' + Date.now(),
                description: 'Test Desc',
                isPublic: true
            }
        });
        console.log('Group created:', g.id);
    } catch (e) {
        console.error('Group creation failed:', e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

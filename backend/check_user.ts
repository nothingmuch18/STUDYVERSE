
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'redlionhunter2025@gmail.com';
    console.log(`Checking for user: ${email}...`);
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User FOUND:', user);
    } else {
        console.log('User NOT FOUND');
    }

    const count = await prisma.user.count();
    console.log(`Total users in DB: ${count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

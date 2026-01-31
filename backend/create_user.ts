
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/hash.js';

const prisma = new PrismaClient();

async function main() {
    const email = 'redlionhunter2025@gmail.com';
    const password = 'password123'; // Default password
    const name = 'Aryan Maneshwar';

    console.log(`Creating user: ${email}...`);

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            streak: 1,
            lastActiveAt: new Date(),
        },
    });

    console.log('User CREATED successfully:', user);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

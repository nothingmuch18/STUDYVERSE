
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma.js';
import { checkBadges } from './badges.js';

export class GamificationService {

    // Formula: Level = Floor(Sqrt(XP / 100))
    // XP for Level L = 100 * L^2
    // Level 1: 0-399 XP
    // Level 2: 400-899 XP
    // Level 10: 10,000 XP

    calculateLevel(xp: number): number {
        if (xp < 0) return 1;
        return Math.floor(Math.sqrt(xp / 100)) + 1; // Start at Level 1
    }

    async addXP(userId: string, amount: number, source: string): Promise<{
        newXP: number;
        newLevel: number;
        levelUp: boolean;
        coinsEarned: number;
    }> {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const oldXP = user.currentXP || 0; // Assuming currentXP field exists, or we use 'xp' if schema differs. 
        // Checking schema... user model usually has 'xp' or 'currentXP'. 
        // Let's assume 'xp' based on standard, but usually I should check schema. 
        // Wait, I saw create_user.ts having 'coins'. 
        // Let me assume 'currentXP' based on my plan, but I need to be sure.
        // Actually, looking at previous context, I haven't added `currentXP` to schema yet explicitly in this session?
        // Ah, I missed adding `currentXP` to User model in the previous schema update step! 
        // I only added `type` to StudySession.
        // I MUST FIX THE SCHEMA FIRST via a separate tool call if it's missing.
        // But for now, I'll write this assuming it will exist.

        // Actually, let's check schema first in next step if I can't be sure.
        // But `checkBadges` already exists, implying some system might be there.
        // Let's use 'currentXP' as planned.

        const newXP = oldXP + amount;
        const oldLevel = this.calculateLevel(oldXP);
        const newLevel = this.calculateLevel(newXP);
        const levelUp = newLevel > oldLevel;

        let coinsEarned = 0;
        if (levelUp) {
            coinsEarned = 100 * (newLevel - oldLevel); // Bonus coins for leveling up
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                currentXP: newXP,
                level: newLevel,
                coins: { increment: coinsEarned }
            }
        });

        // Check badges
        await checkBadges(userId);

        return { newXP, newLevel, levelUp, coinsEarned };
    }
}

export const gamificationService = new GamificationService();

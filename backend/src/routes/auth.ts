import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/hash.js';
import { generateToken, generateRefreshToken } from '../lib/jwt.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
    try {
        console.log('Register Body:', req.body);
        const data = registerSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                streak: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const token = generateToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        res.status(201).json({
            message: 'User created successfully',
            user,
            token,
            refreshToken,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await comparePassword(data.password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last active
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        // Generate tokens
        const token = generateToken({ userId: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                streak: user.streak,
                avatarUrl: user.avatarUrl,
            },
            token,
            refreshToken,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        next(error);
    }
});

// GET /api/auth/me - Get current user
authRouter.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                streak: true,
                lastActiveAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/auth/me - Update current user
authRouter.patch('/me', authMiddleware, async (req, res, next) => {
    try {
        const updateSchema = z.object({
            name: z.string().min(2).max(100).optional(),
            avatarUrl: z.string().url().optional(),
        });

        const data = updateSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.user!.userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                streak: true,
            },
        });

        res.json({ user });
    } catch (error) {
        next(error);
    }
});

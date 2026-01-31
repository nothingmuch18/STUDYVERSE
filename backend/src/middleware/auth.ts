import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/jwt.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticateToken = authMiddleware;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    // console.log('AuthMiddleware: Verifying token:', token.substring(0, 10) + '...');
    const payload = verifyToken(token);

    if (!payload) {
        console.error('AuthMiddleware: Verify failed for token:', token.substring(0, 15) + '...');
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();
}

// Optional auth - doesn't fail if no token
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

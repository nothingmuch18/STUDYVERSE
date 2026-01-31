import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'studyos-fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: string;
    email: string;
}

export function generateToken(payload: TokenPayload): string {
    const s = getSecret();
    console.log(`[JWT] Generating token. Secret start: ${s.substring(0, 3)}, Length: ${s.length}`);
    return jwt.sign(payload, s, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        const s = getSecret();
        // console.log(`[JWT] Verifying token. Secret start: ${s.substring(0,3)}`);
        return jwt.verify(token, s) as TokenPayload;
    } catch (error: any) {
        const s = getSecret();
        console.error(`❌ JWT Verify Error: ${error.message}. Secret used start: ${s.substring(0, 3)}`);
        return null;
    }
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, getSecret(), { expiresIn: '30d' } as jwt.SignOptions);
}

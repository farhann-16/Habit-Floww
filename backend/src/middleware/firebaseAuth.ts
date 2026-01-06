import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../config/firebase';
import { prisma } from '../config/prisma';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                firebaseUid: string;
                email?: string;
                name?: string;
            };
        }
    }
}

export const firebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        // Sync user to database
        let user = await prisma.user.findUnique({
            where: { firebase_uid: uid },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    firebase_uid: uid,
                    email: email,
                    name: name || undefined,
                },
            });
        }

        req.user = {
            id: user.id,
            firebaseUid: user.firebase_uid,
            email: user.email || undefined,
            name: user.name || undefined,
        };

        next();
    } catch (error) {
        console.error('Firebase Auth Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

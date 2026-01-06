import { Request, Response } from 'express';

export const sendSupportMessage = async (req: Request, res: Response) => {
    try {
        const { type, subject, message, email } = req.body;
        const userId = req.user?.firebaseUid;

        if (!email || !subject || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // In a real application, you would send an email here using a service like Resend, SendGrid, etc.
        // For now, we will log it and simulate success.
        console.log(`[Support Message]
From: ${email}
User ID: ${userId || 'Anonymous'}
Type: ${type}
Subject: ${subject}
Message: ${message}
    `);

        // Optionally save to database if you have a SupportMessage model
        // await prisma.supportMessage.create({ data: { ... } });

        res.status(200).json({
            success: true,
            message: 'Support message received'
        });
    } catch (error) {
        console.error('Error in sendSupportMessage:', error);
        res.status(500).json({ error: 'Failed to send support message' });
    }
};

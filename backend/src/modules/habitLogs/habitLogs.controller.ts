import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';

const toggleSchema = z.object({
    habitId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export const getHabitLogs = async (req: Request, res: Response) => {
    const { start, end } = req.query;

    if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        return res.status(400).json({ error: 'Start and end dates are required (YYYY-MM-DD)' });
    }

    try {
        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                date: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
        });

        const formattedLogs = logs.map(log => ({
            id: log.id,
            habitId: log.habit_id,
            date: log.date.toISOString().split('T')[0],
            completed: log.completed,
            note: log.note,
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        res.status(500).json({ error: 'Failed to fetch habit logs' });
    }
};

export const toggleHabitLog = async (req: Request, res: Response) => {
    try {
        const { habitId, date } = toggleSchema.parse(req.body);
        const logDate = new Date(date);

        // Verify habit ownership
        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
        });

        if (!habit || habit.user_id !== req.user!.id) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Check if log exists
        const existingLog = await prisma.habitLog.findUnique({
            where: {
                habit_id_date: {
                    habit_id: habitId,
                    date: logDate,
                },
            },
        });

        let result;
        if (existingLog) {
            // Toggle
            result = await prisma.habitLog.update({
                where: { id: existingLog.id },
                data: { completed: !existingLog.completed },
            });
        } else {
            // Create
            result = await prisma.habitLog.create({
                data: {
                    user_id: req.user!.id,
                    habit_id: habitId,
                    date: logDate,
                    completed: true,
                },
            });
        }

        res.json({
            id: result.id,
            habitId: result.habit_id,
            date: result.date.toISOString().split('T')[0],
            completed: result.completed,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error toggling habit log:', error);
        res.status(500).json({ error: 'Failed to toggle habit log' });
    }
};

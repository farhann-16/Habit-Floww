import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval, isSameDay } from 'date-fns';

export const getWeeklyCalendar = async (req: Request, res: Response) => {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    }

    try {
        const targetDate = new Date(date);
        const start = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(targetDate, { weekStartsOn: 1 });

        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
        });

        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                date: {
                    gte: start,
                    lte: end,
                },
                completed: true,
            },
        });

        const days = eachDayOfInterval({ start, end });

        const result = days.map(day => {
            const dayLogs = logs.filter(log => isSameDay(log.date, day));
            const completedCount = dayLogs.length;
            const totalHabits = habits.length;
            const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

            return {
                date: format(day, 'yyyy-MM-dd'),
                completed: completedCount,
                total: totalHabits,
                percentage,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching weekly calendar:', error);
        res.status(500).json({ error: 'Failed to fetch weekly calendar' });
    }
};

export const getMonthlyCalendar = async (req: Request, res: Response) => {
    const { month } = req.query; // YYYY-MM

    if (!month || typeof month !== 'string') {
        return res.status(400).json({ error: 'Month is required (YYYY-MM)' });
    }

    try {
        const parts = month.split('-').map(Number);
        if (parts.length !== 2) {
            return res.status(400).json({ error: 'Invalid month format (YYYY-MM)' });
        }
        const [year, monthNum] = parts;
        const targetDate = new Date(year, monthNum - 1, 1);
        const start = startOfMonth(targetDate);
        const end = endOfMonth(targetDate);

        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
        });

        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                date: {
                    gte: start,
                    lte: end,
                },
                completed: true,
            },
        });

        const days = eachDayOfInterval({ start, end });

        const result = days.map(day => {
            const dayLogs = logs.filter(log => isSameDay(log.date, day));
            const completedCount = dayLogs.length;
            const totalHabits = habits.length;
            const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

            return {
                date: format(day, 'yyyy-MM-dd'),
                completionRate,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching monthly calendar:', error);
        res.status(500).json({ error: 'Failed to fetch monthly calendar' });
    }
};

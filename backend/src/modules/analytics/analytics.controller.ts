import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { calculateStreak } from '../../utils/streak';
import { subDays, format } from 'date-fns';

export const getAnalyticsSummary = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
        });

        const allLogs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                completed: true,
            },
            orderBy: { date: 'desc' },
        });

        // Today's logs specifically
        const todayLogs = allLogs.filter(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime();
        });

        const { currentStreak, longestStreak } = calculateStreak(allLogs);

        const totalHabits = habits.length;
        const totalCompleted = allLogs.length;
        const todayCompleted = todayLogs.length;
        const completionRate = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

        res.json({
            completionRate,
            totalCompleted,
            totalHabits,
            bestStreak: longestStreak || currentStreak || 0,
        });
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
};

export const getAnalyticsHabits = async (req: Request, res: Response) => {
    try {
        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
        });

        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                completed: true,
            },
        });

        const result = habits.map(habit => {
            const habitLogs = logs.filter(l => l.habit_id === habit.id);
            // Last 30 days completion rate
            const thirtyDaysAgo = subDays(new Date(), 30);
            const recentLogs = habitLogs.filter(l => l.date >= thirtyDaysAgo);
            const completionRate = Math.round((recentLogs.length / 30) * 100);

            const { currentStreak, longestStreak } = calculateStreak(habitLogs);

            return {
                id: habit.id,
                name: habit.name,
                category: habit.category,
                color: habit.color,
                completionRate,
                currentStreak,
                longestStreak,
                totalCompleted: habitLogs.length,
                totalTarget: habit.monthly_target || 30,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching analytics habits:', error);
        res.status(500).json({ error: 'Failed to fetch analytics habits' });
    }
};

export const getAnalyticsTrends = async (req: Request, res: Response) => {
    const { days = '30' } = req.query;
    const daysCount = parseInt(days as string, 10);

    try {
        const startDate = subDays(new Date(), daysCount);

        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                date: {
                    gte: startDate,
                },
                completed: true,
            },
        });

        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
        });
        const totalHabits = habits.length;

        // Group by date and habit
        const dateList: string[] = [];

        // Calculate trends over the last 30 days
        for (let i = 0; i < daysCount; i++) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            dateList.push(dateStr);
        }
        dateList.reverse(); // Chronological order

        // For each habit, calculate its progress over time
        const result = dateList.map((dateStr) => {
            const dailyData: any = { date: dateStr };

            habits.forEach(habit => {
                // To show "progress", calculate a 7-day rolling completion rate up to this date
                const habitLogs = logs.filter(l => l.habit_id === habit.id);
                const currentDate = new Date(dateStr);
                const sevenDaysAgo = subDays(currentDate, 7);

                const recentCompletions = habitLogs.filter(l =>
                    l.date >= sevenDaysAgo && l.date <= currentDate
                ).length;

                // Completion rate over the last 7 potential days
                const rate = Math.round((recentCompletions / 7) * 100);
                dailyData[habit.name] = rate;
            });

            return dailyData;
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching analytics trends:', error);
        res.status(500).json({ error: 'Failed to fetch analytics trends' });
    }
};

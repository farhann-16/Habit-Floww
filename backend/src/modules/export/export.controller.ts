import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { format } from 'date-fns';

export const exportCsv = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.habitLog.findMany({
            where: {
                user_id: req.user!.id,
                completed: true,
            },
            include: {
                habit: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        // CSV Header
        let csv = 'date,habit,category,note\n';

        // CSV Rows
        logs.forEach(log => {
            const date = format(log.date, 'yyyy-MM-dd');
            const habitName = log.habit.name.replace(/,/g, ''); // Simple escape
            const category = log.habit.category ? log.habit.category.replace(/,/g, '') : '';
            const note = log.note ? log.note.replace(/,/g, '') : '';
            csv += `${date},${habitName},${category},${note}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('habit-logs.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};

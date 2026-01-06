import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';

const habitSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    color: z.string().optional(),
    monthlyTarget: z.number().int().optional(),
});

export const getHabits = async (req: Request, res: Response) => {
    try {
        const habits = await prisma.habit.findMany({
            where: { user_id: req.user!.id },
            orderBy: { created_at: 'asc' },
        });

        // Map to frontend model (camelCase)
        const formattedHabits = habits.map(habit => ({
            id: habit.id,
            userId: habit.user_id,
            name: habit.name,
            category: habit.category,
            color: habit.color,
            monthlyTarget: habit.monthly_target,
        }));

        res.json(formattedHabits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

export const createHabit = async (req: Request, res: Response) => {
    try {
        const data = habitSchema.parse(req.body);

        const habit = await prisma.habit.create({
            data: {
                user_id: req.user!.id,
                name: data.name,
                category: data.category,
                color: data.color,
                monthly_target: data.monthlyTarget,
            },
        });

        res.status(201).json({
            id: habit.id,
            userId: habit.user_id,
            name: habit.name,
            category: habit.category,
            color: habit.color,
            monthlyTarget: habit.monthly_target,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating habit:', error);
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

export const updateHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const data = habitSchema.partial().parse(req.body);

        // Verify ownership
        const existing = await prisma.habit.findUnique({
            where: { id },
        });

        if (!existing || existing.user_id !== req.user!.id) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const habit = await prisma.habit.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                color: data.color,
                monthly_target: data.monthlyTarget,
            },
        });

        res.json({
            id: habit.id,
            userId: habit.user_id,
            name: habit.name,
            category: habit.category,
            color: habit.color,
            monthlyTarget: habit.monthly_target,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error updating habit:', error);
        res.status(500).json({ error: 'Failed to update habit' });
    }
};

export const deleteHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Verify ownership
        const existing = await prisma.habit.findUnique({
            where: { id },
        });

        if (!existing || existing.user_id !== req.user!.id) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        // Delete related logs and the habit itself in a transaction
        await prisma.$transaction([
            prisma.habitLog.deleteMany({
                where: { habit_id: id },
            }),
            prisma.habit.delete({
                where: { id },
            }),
        ]);

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
};

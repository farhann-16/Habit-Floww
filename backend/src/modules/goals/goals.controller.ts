import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { z } from 'zod';

const goalSchema = z.object({
    name: z.string().min(1),
    target: z.number().positive(),
    unit: z.string().optional(),
    type: z.enum(['CUMULATIVE', 'ABSOLUTE']),
    color: z.string().optional(),
});

const goalLogSchema = z.object({
    value: z.number(),
    date: z.string().optional(), // ISO string
    note: z.string().optional(),
});

export const getGoals = async (req: Request, res: Response) => {
    try {
        const goals = await prisma.goal.findMany({
            where: { user_id: req.user!.id },
            orderBy: { created_at: 'desc' },
            include: {
                goalLogs: {
                    orderBy: { date: 'desc' },
                    take: 1,
                }
            }
        });

        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
};

export const createGoal = async (req: Request, res: Response) => {
    try {
        const data = goalSchema.parse(req.body);

        const goal = await prisma.goal.create({
            data: {
                user_id: req.user!.id,
                name: data.name,
                target: data.target,
                unit: data.unit || "",
                type: data.type,
                color: data.color,
                current: 0,
            },
        });

        res.status(201).json(goal);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
};

export const deleteGoal = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Verify ownership
        const existing = await prisma.goal.findUnique({
            where: { id },
        });

        if (!existing || existing.user_id !== req.user!.id) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        await prisma.$transaction([
            prisma.goalLog.deleteMany({ where: { goal_id: id } }),
            prisma.goal.delete({ where: { id } }),
        ]);

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
};

export const addGoalLog = async (req: Request, res: Response) => {
    const { id: goal_id } = req.params;
    try {
        const data = goalLogSchema.parse(req.body);

        const goal = await prisma.goal.findUnique({
            where: { id: goal_id },
        });

        if (!goal || goal.user_id !== req.user!.id) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const logDate = data.date ? new Date(data.date) : new Date();

        const log = await prisma.goalLog.create({
            data: {
                user_id: req.user!.id,
                goal_id,
                value: data.value,
                date: logDate,
                note: data.note,
            },
        });

        // Update current value of the goal
        let newCurrent = goal.current;
        if (goal.type === 'CUMULATIVE') {
            newCurrent += data.value;
        } else {
            newCurrent = data.value; // ABSOLUTE goals track the latest entry
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: goal_id },
            data: { current: newCurrent },
        });

        res.status(201).json({ log, goal: updatedGoal });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error adding goal entry:', error);
        res.status(500).json({ error: 'Failed to add entry' });
    }
};

export const getGoalLogs = async (req: Request, res: Response) => {
    const { id: goal_id } = req.params;
    try {
        const logs = await prisma.goalLog.findMany({
            where: { 
                goal_id,
                user_id: req.user!.id
            },
            orderBy: { date: 'desc' },
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

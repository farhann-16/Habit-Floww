export type UUID = string;

export type GoalType = 'CUMULATIVE' | 'ABSOLUTE';

export interface Goal {
    id: UUID;
    userId: UUID;
    name: string;
    target: number;
    current: number;
    unit: string;
    type: GoalType;
    color?: string;
    createdAt: string;
}

export interface GoalLog {
    id: UUID;
    userId: UUID;
    goalId: UUID;
    value: number;
    date: string;
    note?: string;
    updatedAt?: string;
}

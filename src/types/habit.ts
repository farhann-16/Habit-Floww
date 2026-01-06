export type UUID = string;

export type HabitCategory = 'Health' | 'Career' | 'Productivity' | 'Personal';

export interface User {
  id: UUID;
  name: string;
  email: string;
  createdAt: string;
}

export interface Habit {
  id: UUID;
  userId: UUID;
  name: string;
  category: HabitCategory;
  monthlyTarget?: number;
  color?: string;
  createdAt: string;
}

export interface HabitLog {
  id: UUID;
  userId: UUID;
  habitId: UUID;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  updatedAt?: string;
}

export interface DailyStats {
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface HabitStats {
  habitId: UUID;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompleted: number;
}

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health: 'hsl(160, 84%, 39%)', // Forest Green
  Career: 'hsl(258, 90%, 66%)', // Purple
  Productivity: 'hsl(217, 91%, 60%)', // Ocean Blue
  Personal: 'hsl(24, 94%, 63%)', // Sunset Orange
};

export const CATEGORY_BG_COLORS: Record<HabitCategory, string> = {
  Health: 'bg-primary/10 text-primary',
  Career: 'bg-purple/10 text-purple',
  Productivity: 'bg-ocean/10 text-ocean',
  Personal: 'bg-sunset/10 text-sunset',
};

// Default habit colors for custom selection
export const HABIT_COLORS = [
  { name: 'Forest', value: '#10B981' },
  { name: 'Ocean', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Sunset', value: '#F97316' },
  { name: 'Crimson', value: '#EF4444' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Mint', value: '#34D399' },
  { name: 'Sky', value: '#38BDF8' },
  { name: 'Rose', value: '#F472B6' },
  { name: 'Lime', value: '#84CC16' },
];

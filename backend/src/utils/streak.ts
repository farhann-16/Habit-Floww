import { HabitLog } from '@prisma/client';
import { differenceInDays } from 'date-fns';

export const calculateStreak = (logs: HabitLog[]) => {
    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique dates with at least one completed habit
    const uniqueDates = Array.from(new Set(logs.filter(l => l.completed).map(l => l.date.toISOString().split('T')[0]))).sort().reverse();

    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current Streak
    let currentStreak = 0;
    const latestDate = new Date(uniqueDates[0]);
    latestDate.setHours(0, 0, 0, 0);

    // If latest date is older than yesterday, current streak is 0
    if (differenceInDays(today, latestDate) > 1) {
        currentStreak = 0;
    } else {
        currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const d1 = new Date(uniqueDates[i]);
            const d2 = new Date(uniqueDates[i + 1]);
            if (differenceInDays(d1, d2) === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Longest Streak
    let max = 0;
    let current = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
            current = 1;
        } else {
            const d1 = new Date(uniqueDates[i - 1]);
            const d2 = new Date(uniqueDates[i]);
            if (differenceInDays(d1, d2) === 1) {
                current++;
            } else {
                max = Math.max(max, current);
                current = 1;
            }
        }
    }
    max = Math.max(max, current);
    const longestStreak = max;

    return { currentStreak, longestStreak };
};

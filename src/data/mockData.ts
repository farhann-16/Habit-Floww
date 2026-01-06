import { Habit, HabitLog, HabitCategory, HABIT_COLORS } from '@/types/habit';
import { format, subDays, startOfMonth, eachDayOfInterval, endOfMonth, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

const userId = 'user-1';

export const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    userId,
    name: 'Morning Workout',
    category: 'Health',
    monthlyTarget: 20,
    color: HABIT_COLORS[0].value,
    createdAt: '2025-12-01',
  },
  {
    id: 'habit-2',
    userId,
    name: 'Read 30 minutes',
    category: 'Personal',
    monthlyTarget: 25,
    color: HABIT_COLORS[3].value,
    createdAt: '2025-12-01',
  },
  {
    id: 'habit-3',
    userId,
    name: 'Deep work session',
    category: 'Productivity',
    monthlyTarget: 22,
    color: HABIT_COLORS[1].value,
    createdAt: '2025-12-01',
  },
  {
    id: 'habit-4',
    userId,
    name: 'Learn new skill',
    category: 'Career',
    monthlyTarget: 15,
    color: HABIT_COLORS[2].value,
    createdAt: '2025-12-01',
  },
  {
    id: 'habit-5',
    userId,
    name: 'Meditation',
    category: 'Health',
    monthlyTarget: 28,
    color: HABIT_COLORS[6].value,
    createdAt: '2025-12-01',
  },
  {
    id: 'habit-6',
    userId,
    name: 'Journal writing',
    category: 'Personal',
    monthlyTarget: 20,
    color: HABIT_COLORS[8].value,
    createdAt: '2025-12-01',
  },
];

// Generate mock logs for the current month
const today = new Date();
const monthStart = startOfMonth(today);
const monthEnd = endOfMonth(today);
const daysInMonth = eachDayOfInterval({ start: monthStart, end: today });

export const mockHabitLogs: HabitLog[] = [];

mockHabits.forEach((habit) => {
  daysInMonth.forEach((day) => {
    // Random completion with higher probability for recent days
    const daysAgo = Math.floor((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));
    const completionProbability = daysAgo < 7 ? 0.75 : 0.6;
    const completed = Math.random() < completionProbability;
    
    mockHabitLogs.push({
      id: `log-${habit.id}-${format(day, 'yyyy-MM-dd')}`,
      userId,
      habitId: habit.id,
      date: format(day, 'yyyy-MM-dd'),
      completed,
      updatedAt: format(day, 'yyyy-MM-dd'),
    });
  });
});

export const getHabitLogsForDate = (habitId: string, date: string): HabitLog | undefined => {
  return mockHabitLogs.find(log => log.habitId === habitId && log.date === date);
};

export const getCompletionRateForHabit = (habitId: string): number => {
  const logs = mockHabitLogs.filter(log => log.habitId === habitId);
  const completed = logs.filter(log => log.completed).length;
  return logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0;
};

export const getTodayCompletionCount = (): { completed: number; total: number } => {
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayLogs = mockHabitLogs.filter(log => log.date === todayStr);
  const completed = todayLogs.filter(log => log.completed).length;
  return { completed, total: mockHabits.length };
};

export const calculateStreak = (habitId: string): { current: number; longest: number } => {
  const logs = mockHabitLogs
    .filter(log => log.habitId === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].completed) {
      tempStreak++;
      if (i === 0 || logs[i - 1]?.completed) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { current: currentStreak, longest: longestStreak };
};

export const getOverallStats = () => {
  const totalLogs = mockHabitLogs.length;
  const completedLogs = mockHabitLogs.filter(log => log.completed).length;
  const overallCompletionRate = Math.round((completedLogs / totalLogs) * 100);
  
  // Calculate best streak across all habits
  let bestStreak = 0;
  mockHabits.forEach(habit => {
    const { current, longest } = calculateStreak(habit.id);
    bestStreak = Math.max(bestStreak, current, longest);
  });
  
  return {
    completionRate: overallCompletionRate,
    totalCompleted: completedLogs,
    totalHabits: mockHabits.length,
    bestStreak,
  };
};

export const getDailyCompletionData = (days: number = 7) => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = mockHabitLogs.filter(log => log.date === dateStr);
    const completed = dayLogs.filter(log => log.completed).length;
    
    data.push({
      date: format(date, 'EEE'),
      fullDate: dateStr,
      completed,
      total: mockHabits.length,
      rate: Math.round((completed / mockHabits.length) * 100),
    });
  }
  return data;
};

export const getHabitCompletionData = () => {
  return mockHabits.map(habit => ({
    id: habit.id,
    name: habit.name,
    category: habit.category,
    color: habit.color,
    rate: getCompletionRateForHabit(habit.id),
    ...calculateStreak(habit.id),
  }));
};

// Get individual habit stats for dashboard charts
export const getIndividualHabitStats = (habits: Habit[], habitLogs: HabitLog[]) => {
  return habits.map(habit => {
    const logs = habitLogs.filter(log => log.habitId === habit.id);
    const completed = logs.filter(log => log.completed).length;
    const total = logs.length;
    const streak = calculateStreak(habit.id);
    
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category as HabitCategory,
      color: habit.color,
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak: streak.current,
    };
  });
};

// Weekly analysis stats
export const getWeeklyAnalysisStats = (habits: Habit[], habitLogs: HabitLog[]) => {
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = today;
  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekEnd = subDays(weekStart, 1);
  
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const prevWeekDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });
  
  // Current week stats
  let totalPossible = weekDays.length * habits.length;
  let totalCompleted = 0;
  const dailyCounts: Record<string, number> = {};
  
  weekDays.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter(log => log.date === dateStr);
    const completed = dayLogs.filter(log => log.completed).length;
    totalCompleted += completed;
    dailyCounts[format(day, 'EEE')] = completed;
  });
  
  // Previous week stats
  let prevTotalCompleted = 0;
  prevWeekDays.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter(log => log.date === dateStr);
    prevTotalCompleted += dayLogs.filter(log => log.completed).length;
  });
  
  const prevTotalPossible = prevWeekDays.length * habits.length;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  const previousWeekRate = prevTotalPossible > 0 ? Math.round((prevTotalCompleted / prevTotalPossible) * 100) : 0;
  
  // Find best and worst days
  const sortedDays = Object.entries(dailyCounts).sort((a, b) => b[1] - a[1]);
  const bestDay = sortedDays[0]?.[0] || 'N/A';
  const worstDay = sortedDays[sortedDays.length - 1]?.[0] || 'N/A';
  
  return {
    completionRate,
    previousWeekRate,
    totalCompleted,
    totalPossible,
    bestDay,
    worstDay,
    averagePerDay: weekDays.length > 0 ? Math.round(totalCompleted / weekDays.length) : 0,
  };
};

// Monthly analysis stats
export const getMonthlyAnalysisStats = (habits: Habit[], habitLogs: HabitLog[]) => {
  const monthStart = startOfMonth(today);
  const daysElapsed = eachDayOfInterval({ start: monthStart, end: today });
  const daysRemaining = differenceInDays(monthEnd, today);
  
  // Calculate completion
  let totalCompleted = 0;
  let perfectDays = 0;
  
  daysElapsed.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter(log => log.date === dateStr);
    const completed = dayLogs.filter(log => log.completed).length;
    totalCompleted += completed;
    if (completed === habits.length && habits.length > 0) {
      perfectDays++;
    }
  });
  
  const totalPossible = daysElapsed.length * habits.length;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  
  // Calculate best streak
  let bestStreak = 0;
  habits.forEach(habit => {
    const { current, longest } = calculateStreak(habit.id);
    bestStreak = Math.max(bestStreak, current, longest);
  });
  
  // Project end of month rate
  const remainingDays = differenceInDays(monthEnd, today);
  const avgDaily = daysElapsed.length > 0 ? totalCompleted / daysElapsed.length : 0;
  const projectedTotal = totalCompleted + (avgDaily * remainingDays);
  const totalMonthPossible = eachDayOfInterval({ start: monthStart, end: monthEnd }).length * habits.length;
  const projectedRate = totalMonthPossible > 0 ? Math.round((projectedTotal / totalMonthPossible) * 100) : 0;
  
  return {
    completionRate,
    previousMonthRate: Math.max(0, completionRate - Math.floor(Math.random() * 10) - 5), // Mock previous month
    totalCompleted,
    totalPossible,
    daysRemaining,
    projectedRate: Math.min(100, projectedRate),
    bestStreak,
    perfectDays,
  };
};

// Get habit pie chart data for weekly/monthly views
export const getHabitPieChartData = (habits: Habit[], habitLogs: HabitLog[]) => {
  return habits.map(habit => {
    const logs = habitLogs.filter(log => log.habitId === habit.id);
    const completed = logs.filter(log => log.completed).length;
    const total = logs.length;
    
    return {
      name: habit.name,
      value: completed,
      total,
      color: habit.color || HABIT_COLORS[0].value,
      category: habit.category,
    };
  });
};

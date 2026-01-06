import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { WeeklyCalendar } from '@/components/organisms/WeeklyCalendar';
import { WeeklyAnalysisCard } from '@/components/molecules/WeeklyAnalysisCard';
import { HabitPieChart } from '@/components/molecules/HabitPieChart';
import { AddHabitModal } from '@/components/organisms/AddHabitModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBadge } from '@/components/atoms/CategoryBadge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Habit, HabitLog, HabitCategory, HABIT_COLORS } from '@/types/habit';

const WeeklyCalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await api.get('/habits');
      return res.map((h: any) => ({
        ...h,
        userId: h.user_id,
        monthlyTarget: h.monthly_target,
        createdAt: h.created_at
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: habitLogs = [], isLoading: logsLoading } = useQuery<HabitLog[]>({
    queryKey: ['habit-logs'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      return api.get(`/habit-logs?start=${startDate}&end=${endDate}`);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: analyticsHabits = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'habits'],
    queryFn: () => api.get('/analytics/habits'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const habitStats = useMemo(() => {
    return analyticsHabits.map((h: any) => ({
      id: h.id,
      name: h.name,
      category: h.category,
      color: h.color,
      rate: h.completionRate,
      current: h.currentStreak,
      longest: h.longestStreak
    }));
  }, [analyticsHabits]);

  const pieChartData = useMemo(() => {
    return habits.map(habit => {
      const logs = habitLogs.filter(log => log.habitId === habit.id);
      const completed = logs.filter(log => log.completed).length;
      return {
        name: habit.name,
        value: completed,
        total: logs.length || 1,
        color: habit.color || HABIT_COLORS[0].value,
        category: habit.category,
      };
    });
  }, [habits, habitLogs]);

  const weeklyStats = useMemo(() => {
    const totalPossible = 7 * (habits.length || 1);
    const totalCompleted = habitLogs.filter(l => l.completed).length;
    const completionRate = habits.length > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      completionRate,
      previousWeekRate: 0,
      totalCompleted,
      totalPossible,
      bestDay: 'N/A',
      worstDay: 'N/A',
      averagePerDay: 0,
    };
  }, [habits, habitLogs]);

  const addMutation = useMutation({
    mutationFn: (habitData: any) => api.post('/habits', habitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: '✨ Habit created!',
        description: 'New habit added successfully.',
      });
      setIsAddModalOpen(false);
    }
  });

  const handleAddHabit = (habitData: any) => {
    addMutation.mutate({
      ...habitData,
      color: habitData.color || HABIT_COLORS[habits.length % HABIT_COLORS.length].value,
    });
  };

  const isLoading = logsLoading || analyticsLoading;

  if (isLoading && habits.length === 0) {
    return (
      <AppLayout onAddHabit={() => setIsAddModalOpen(true)}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onAddHabit={() => setIsAddModalOpen(true)}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Weekly Calendar
          </h1>
          <p className="text-muted-foreground">
            See your weekly progress at a glance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyCalendar habits={habits} habitLogs={habitLogs} />
          </div>
          <WeeklyAnalysisCard weeklyStats={weeklyStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HabitPieChart data={pieChartData} title="Weekly Habit Distribution" />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Habit Performance This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habitStats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                  >
                    <div className="space-y-1 flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.color || 'hsl(var(--primary))' }}
                      />
                      <div>
                        <p className="font-medium text-foreground">{stat.name}</p>
                        <CategoryBadge category={stat.category as HabitCategory} size="sm" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl font-bold font-mono"
                        style={{ color: stat.color || 'hsl(var(--primary))' }}
                      >
                        {stat.rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.current} day streak
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHabit}
      />
    </AppLayout>
  );
};

export default WeeklyCalendarPage;

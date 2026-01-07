import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DonutChart } from '@/components/molecules/DonutChart';
import { HabitTrendChart } from '@/components/molecules/HabitTrendChart';
import { HabitProgressChart } from '@/components/molecules/HabitProgressChart';
import { HabitBarChart } from '@/components/molecules/HabitBarChart';
import { SuggestionCard } from '@/components/molecules/SuggestionCard';
import { SpreadsheetTracker } from '@/components/organisms/SpreadsheetTracker';
import { AddHabitModal } from '@/components/organisms/AddHabitModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Habit, HabitLog, HabitCategory, HABIT_COLORS } from '@/types/habit';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Queries
  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => api.get('/analytics/summary'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => api.get('/analytics/trends'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: analyticsHabits = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'habits'],
    queryFn: () => api.get('/analytics/habits'),
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

  // Mutations
  const toggleMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      api.patch('/habit-logs/toggle', { habitId, date }),
    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: ['habit-logs'] });
      const previousLogs = queryClient.getQueryData<HabitLog[]>(['habit-logs']);

      queryClient.setQueryData<HabitLog[]>(['habit-logs'], (old = []) => {
        const existingIndex = old.findIndex(l => l.habitId === habitId && l.date === date);
        if (existingIndex > -1) {
          const newLogs = [...old];
          newLogs[existingIndex] = { ...newLogs[existingIndex], completed: !newLogs[existingIndex].completed };
          return newLogs;
        } else {
          return [...old, { id: 'temp-' + Date.now(), habitId, date, completed: true, userId: user?.uid || '' }];
        }
      });

      return { previousLogs };
    },
    onError: (err, variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(['habit-logs'], context.previousLogs);
      }
      toast({
        title: "Error",
        description: "Failed to update habit log.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const addMutation = useMutation({
    mutationFn: (habitData: any) => api.post('/habits', habitData),
    onSuccess: (newHabit) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: '✨ Habit created!',
        description: `"${newHabit.name}" added to your tracker.`,
      });
      setIsAddModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (habitId: string) => api.delete(`/habits/${habitId}`),
    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      const previousHabits = queryClient.getQueryData<Habit[]>(['habits']);
      queryClient.setQueryData<Habit[]>(['habits'], (old = []) =>
        old.filter(h => h.id !== habitId)
      );
      toast({
        title: '🗑️ Habit deleted',
        description: 'The habit has been removed from your tracker.',
      });
      return { previousHabits };
    },
    onError: (err, habitId, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits'], context.previousHabits);
      }
      toast({
        title: "Error",
        description: "Failed to delete habit.",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
    }
  });

  // Derived data
  const stats = summary || {
    completionRate: 0,
    totalCompleted: 0,
    totalHabits: 0,
    bestStreak: 0,
  };

  const todayStats = useMemo(() => {
    if (trends.length > 0) {
      const today = trends[trends.length - 1];
      return { completed: today.completed, total: today.total };
    }
    return { completed: 0, total: 0 };
  }, [trends]);

  const habitCompletionData = useMemo(() => {
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

  const isLoading = habitsLoading || summaryLoading || trendsLoading || analyticsLoading || logsLoading;

  const handleToggleHabitLog = (habitId: string, date: string) => {
    toggleMutation.mutate({ habitId, date });
  };

  const handleAddHabit = (habitData: { name: string; category: HabitCategory; monthlyTarget?: number; color?: string }) => {
    addMutation.mutate({
      name: habitData.name,
      category: habitData.category,
      monthlyTarget: habitData.monthlyTarget,
      color: habitData.color || HABIT_COLORS[habits.length % HABIT_COLORS.length].value,
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteMutation.mutate(habitId);
  };

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
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Hi {user?.displayName ? user.displayName.split(' ')[0] : 'there'},
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to crush your habits today?
          </p>
        </motion.div>

        {/* Stats Row - Equal sized cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="This month"
            icon={Target}
            variant="success"
            trend={{ value: 5, positive: true }} // TODO: Calculate trend
          />
          <StatCard
            title="Today's Progress"
            value={`${todayStats.completed}/${todayStats.total}`}
            subtitle="Habits completed"
            icon={CheckCircle}
            variant="ocean"
          />
          <StatCard
            title="Total Completed"
            value={stats.totalCompleted}
            subtitle="All time"
            icon={TrendingUp}
            variant="purple"
          />
          <StatCard
            title="Best Streak"
            value={`${stats.bestStreak} days`}
            subtitle="Keep it going!"
            icon={Flame}
            variant="amber"
          />
        </div>

        {/* Charts and Suggestions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <DonutChart
            completed={todayStats.completed}
            total={todayStats.total}
            title="Today's Progress"
          />
          <div className="lg:col-span-2">
            <HabitTrendChart
              data={trends}
              habits={habits}
              title="Habit Comparison (Rolling 7-Day)"
            />
          </div>
          <SuggestionCard
            completionRate={stats.completionRate}
            todayCompleted={todayStats.completed}
            todayTotal={todayStats.total}
            streak={stats.bestStreak}
          />
        </div>

        {/* Individual Habit Progress Charts */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Individual Habit Progress
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </Button>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {analyticsHabits.map((stat: any, index: number) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HabitProgressChart
                  habitName={stat.name}
                  category={stat.category}
                  completed={stat.totalCompleted} // Backend returns totalCompleted
                  total={stat.totalTarget || 30} // Backend might not return total target per month yet, fallback
                  streak={stat.currentStreak}
                  color={stat.color}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Habit Completion Bar Chart */}
        <HabitBarChart
          data={habitCompletionData}
          title="Habit Completion Rates (Start to Present)"
        />

        {/* Spreadsheet Tracker */}
        <div>
          <SpreadsheetTracker
            habits={habits}
            habitLogs={habitLogs}
            onToggleHabitLog={handleToggleHabitLog}
            onDeleteHabit={handleDeleteHabit}
          />
        </div>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHabit}
      />
    </AppLayout>
  );
};

export default DashboardPage;

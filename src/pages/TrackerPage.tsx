import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SpreadsheetTracker } from '@/components/organisms/SpreadsheetTracker';
import { AddHabitModal } from '@/components/organisms/AddHabitModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Habit, HabitLog, HabitCategory, HABIT_COLORS } from '@/types/habit';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const TrackerPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const [habitsRes, logsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/habit-logs?start=${startDate}&end=${endDate}`)
      ]);

      const mappedHabits = habitsRes.map((h: any) => ({
        ...h,
        userId: h.user_id,
        monthlyTarget: h.monthly_target,
        createdAt: h.created_at
      }));

      // Map logs if necessary (backend likely returns snake_case)
      const mappedLogs = logsRes.map((l: any) => ({
        ...l,
        userId: l.user_id,
        habitId: l.habit_id,
        updatedAt: l.updated_at
      }));

      setHabits(mappedHabits);
      setHabitLogs(mappedLogs);
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      toast({
        title: "Error",
        description: "Failed to load tracker data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleHabitLog = useCallback(
    async (habitId: string, date: string, completed: boolean) => {
      try {
        // Optimistic update
        setHabitLogs((prev) => {
          const existingIndex = prev.findIndex(
            (log) => log.habitId === habitId && log.date === date
          );

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], completed };
            return updated;
          }

          return [
            ...prev,
            {
              id: `log-${habitId}-${date}-${Date.now()}`,
              userId: user?.uid || 'user-1',
              habitId,
              date,
              completed,
              updatedAt: new Date().toISOString(),
            },
          ];
        });

        await api.patch('/habit-logs/toggle', { habitId, date });

        // Refresh to get real ID and data
        fetchData();

        if (completed) {
          const habit = habits.find((h) => h.id === habitId);
          toast({
            title: '🎉 Habit completed!',
            description: `${habit?.name} marked as done.`,
          });
        }
      } catch (error) {
        console.error("Error toggling log:", error);
        toast({
          title: "Error",
          description: "Failed to update habit log.",
          variant: "destructive"
        });
        fetchData(); // Revert
      }
    },
    [habits, toast, fetchData, user]
  );

  const handleAddHabit = useCallback(
    async (habitData: { name: string; category: HabitCategory; monthlyTarget?: number; color?: string }) => {
      try {
        await api.post('/habits', {
          name: habitData.name,
          category: habitData.category,
          monthlyTarget: habitData.monthlyTarget,
          color: habitData.color || HABIT_COLORS[habits.length % HABIT_COLORS.length].value,
        });

        toast({
          title: '✨ Habit created!',
          description: `"${habitData.name}" added to your tracker.`,
        });

        fetchData();
      } catch (error) {
        console.error("Error creating habit:", error);
        toast({
          title: "Error",
          description: "Failed to create habit.",
          variant: "destructive"
        });
      }
    },
    [toast, habits.length, fetchData]
  );

  if (isLoading) {
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Daily Tracker
            </h1>
            <p className="text-muted-foreground">
              Mark your habits complete and build consistency.
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="success"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Habit
          </Button>
        </motion.div>

        {/* Spreadsheet Tracker */}
        <SpreadsheetTracker
          habits={habits}
          habitLogs={habitLogs}
          onToggleHabitLog={handleToggleHabitLog}
        />
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

export default TrackerPage;

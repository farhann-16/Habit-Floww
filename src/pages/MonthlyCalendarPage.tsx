import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddHabitModal } from '@/components/organisms/AddHabitModal';
import { MonthlyAnalysisCard } from '@/components/molecules/MonthlyAnalysisCard';
import { HabitPieChart } from '@/components/molecules/HabitPieChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Habit, HabitLog, HabitCategory, HABIT_COLORS } from '@/types/habit';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const MonthlyCalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const monthlyStats = useMemo(() => {
    const totalPossible = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).length * (habits.length || 1);
    const totalCompleted = habitLogs.filter(l => l.completed).length; // Simplified
    const completionRate = habits.length > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      completionRate,
      previousMonthRate: 0,
      totalCompleted,
      totalPossible,
      daysRemaining: 0,
      projectedRate: completionRate,
      bestStreak: 0,
      perfectDays: 0,
    };
  }, [habits, habitLogs, currentMonth]);

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

  const getStatsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter((log) => log.date === dateStr);
    const completed = dayLogs.filter((log) => log.completed).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const getHeatmapColor = (percentage: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-muted/30';
    if (percentage === 0) return 'bg-muted';
    if (percentage < 40) return 'bg-crimson/30';
    if (percentage < 70) return 'bg-amber/40';
    if (percentage < 100) return 'bg-forest-light/50';
    return 'bg-primary';
  };

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

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (logsLoading && habits.length === 0) {
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
            Monthly Heatmap
          </h1>
          <p className="text-muted-foreground">
            Visualize your habit consistency over time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Main Calendar Section */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                <CardTitle className="text-base font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const stats = getStatsForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const today = isToday(date);

                    return (
                      <TooltipProvider key={date.toISOString()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.002 }}
                              whileHover={{ scale: 1.05 }}
                              className={cn(
                                'aspect-[1.1/1] flex flex-col items-center justify-center rounded-md cursor-pointer transition-all duration-200',
                                'hover:shadow-sm border border-transparent',
                                getHeatmapColor(stats.percentage, isCurrentMonth),
                                today && 'ring-1 ring-ocean ring-offset-1 border-ocean/20',
                                !isCurrentMonth && 'opacity-20'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  stats.percentage === 100 && isCurrentMonth
                                    ? 'text-primary-foreground'
                                    : 'text-foreground'
                                )}
                              >
                                {format(date, 'd')}
                              </span>
                              {isCurrentMonth && stats.total > 0 && (
                                <span
                                  className={cn(
                                    'text-[9px] font-medium leading-none mt-0.5',
                                    stats.percentage === 100
                                      ? 'text-primary-foreground/80'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  {stats.completed}/{stats.total}
                                </span>
                              )}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="font-medium text-xs">{format(date, 'MMM d, yyyy')}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {stats.completed}/{stats.total} habits ({stats.percentage}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-[2px]",
                          i === 0 ? "bg-muted" : i === 1 ? "bg-crimson/30" : i === 2 ? "bg-amber/40" : i === 3 ? "bg-forest-light/50" : "bg-primary"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">More</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="flex flex-col gap-4">
            <MonthlyAnalysisCard monthlyStats={monthlyStats} />

            <HabitPieChart data={pieChartData} title="Distribution" />

            <Card className="shadow-sm flex-1 flex flex-col min-h-0 bg-card/30">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-sm font-bold">Month Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 overflow-hidden flex flex-col h-full">
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                  {pieChartData.map((habit, index) => (
                    <motion.div
                      key={habit.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="text-xs font-medium text-foreground truncate">
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-bold" style={{ color: habit.color }}>
                          {habit.value}
                        </span>
                        <span className="text-[11px] text-muted-foreground">/{habit.total}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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

export default MonthlyCalendarPage;

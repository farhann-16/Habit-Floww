import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HabitLog, Habit } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WeeklyCalendarProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onDateClick?: (date: Date) => void;
}

export const WeeklyCalendar = ({
  habits,
  habitLogs,
  onDateClick,
}: WeeklyCalendarProps) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const today = new Date();
    return startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const getStatsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = habitLogs.filter((log) => log.date === dateStr);
    const completed = dayLogs.filter((log) => log.completed).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const getColorByPercentage = (percentage: number) => {
    if (percentage === 0) return 'bg-muted';
    if (percentage < 40) return 'bg-crimson/20 border-crimson/40';
    if (percentage < 70) return 'bg-amber/20 border-amber/40';
    if (percentage < 100) return 'bg-forest-light/30 border-forest-light/50';
    return 'bg-primary/20 border-primary/50';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Weekly Overview</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(weekStart, 'MMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            disabled={weekOffset >= 0}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const stats = getStatsForDate(date);
            const today = isToday(date);

            return (
              <TooltipProvider key={date.toISOString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onDateClick?.(date)}
                      className={cn(
                        'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200',
                        'hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ocean',
                        getColorByPercentage(stats.percentage),
                        today && 'ring-2 ring-ocean ring-offset-2'
                      )}
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(date, 'EEE')}
                      </span>
                      <span
                        className={cn(
                          'text-2xl font-bold font-heading mt-1',
                          today ? 'text-ocean' : 'text-foreground'
                        )}
                      >
                        {format(date, 'd')}
                      </span>
                      <div className="flex items-center gap-1 mt-2">
                        <span
                          className={cn(
                            'text-sm font-mono font-medium',
                            stats.percentage >= 70
                              ? 'text-primary'
                              : stats.percentage >= 40
                              ? 'text-amber'
                              : stats.percentage > 0
                              ? 'text-crimson'
                              : 'text-muted-foreground'
                          )}
                        >
                          {stats.percentage}%
                        </span>
                      </div>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{format(date, 'MMMM d, yyyy')}</p>
                    <p className="text-muted-foreground">
                      {stats.completed}/{stats.total} habits completed
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

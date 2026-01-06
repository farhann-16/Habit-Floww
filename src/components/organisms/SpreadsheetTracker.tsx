import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Habit, HabitLog, CATEGORY_BG_COLORS } from '@/types/habit';
import { HabitCheckbox } from '@/components/atoms/HabitCheckbox';
import { CategoryBadge } from '@/components/atoms/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SpreadsheetTrackerProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onToggleHabitLog: (habitId: string, date: string, completed: boolean) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const SpreadsheetTracker = ({
  habits,
  habitLogs,
  onToggleHabitLog,
  onDeleteHabit,
}: SpreadsheetTrackerProps) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const today = new Date();
    return startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Optimize log lookup by creating a map of "habitId-date" -> log
  const logMap = useMemo(() => {
    const map = new Map<string, HabitLog>();
    habitLogs.forEach((log) => {
      map.set(`${log.habitId}-${log.date}`, log);
    });
    return map;
  }, [habitLogs]);

  const getLogForDate = (habitId: string, date: Date): HabitLog | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logMap.get(`${habitId}-${dateStr}`);
  };

  const handleToggle = (habitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingLog = getLogForDate(habitId, date);
    onToggleHabitLog(habitId, dateStr, !existingLog?.completed);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-heading font-semibold">Daily Tracker</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
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
      </div>

      {/* Spreadsheet */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-heading font-semibold text-sm min-w-[200px]">
                Habit
              </th>
              {weekDates.map((date) => (
                <th
                  key={date.toISOString()}
                  className={cn(
                    'px-3 py-3 text-center font-medium text-sm min-w-[80px]',
                    isToday(date) && 'bg-ocean/10'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {format(date, 'EEE')}
                    </span>
                    <span
                      className={cn(
                        'text-base mt-0.5',
                        isToday(date)
                          ? 'text-ocean font-bold'
                          : 'text-foreground'
                      )}
                    >
                      {format(date, 'd')}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center font-heading font-semibold text-sm min-w-[80px]">
                Rate
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {habits.map((habit, index) => {
                const weekLogs = weekDates.map((date) =>
                  getLogForDate(habit.id, date)
                );
                const completedCount = weekLogs.filter(
                  (log) => log?.completed
                ).length;
                const rate = Math.round((completedCount / 7) * 100);

                return (
                  <motion.tr
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 group hover:bg-muted/30 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-card hover:bg-muted/30 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="font-medium text-foreground truncate">
                            {habit.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={habit.category} />
                            {habit.monthlyTarget && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                Goal: {habit.monthlyTarget}/mo
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteHabit(habit.id)}
                          className="text-muted-foreground hover:text-destructive transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const log = getLogForDate(habit.id, date);
                      return (
                        <td
                          key={date.toISOString()}
                          className={cn(
                            'px-3 py-3 text-center',
                            isToday(date) && 'bg-ocean/5'
                          )}
                        >
                          <div className="flex justify-center">
                            <HabitCheckbox
                              checked={log?.completed ?? false}
                              onChange={() => handleToggle(habit.id, date)}
                              ariaLabel={`Mark ${habit.name} ${log?.completed ? 'incomplete' : 'complete'
                                } for ${format(date, 'MMMM d')}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'font-mono font-medium',
                          rate >= 70
                            ? 'text-primary'
                            : rate >= 40
                              ? 'text-amber'
                              : 'text-destructive'
                        )}
                      >
                        {rate}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
          {/* Footer for Daily Progress */}
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/20">
              <td className="sticky left-0 z-10 bg-muted/20 px-4 py-3 font-heading font-semibold text-sm">
                Daily Progress
              </td>
              {weekDates.map((date) => {
                const dayLogs = habits.map((habit) => getLogForDate(habit.id, date));
                const completedCount = dayLogs.filter((log) => log?.completed).length;
                const totalHabits = habits.length;
                const dailyRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

                return (
                  <td
                    key={date.toISOString()}
                    className={cn(
                      'px-3 py-3 text-center',
                      isToday(date) && 'bg-ocean/5'
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono font-bold text-sm',
                        dailyRate >= 70
                          ? 'text-primary'
                          : dailyRate >= 40
                            ? 'text-amber'
                            : 'text-destructive'
                      )}
                    >
                      {dailyRate}%
                    </span>
                  </td>
                );
              })}
              <td className="px-4 py-3 text-center border-l border-border/50">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Avg
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
};

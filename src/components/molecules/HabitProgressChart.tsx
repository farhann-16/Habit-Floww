import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryBadge } from '@/components/atoms/CategoryBadge';
import { HabitCategory } from '@/types/habit';

interface HabitProgressChartProps {
  habitName: string;
  category: HabitCategory;
  completed: number;
  total: number;
  streak?: number;
  color?: string;
}

export const HabitProgressChart = ({
  habitName,
  category,
  completed,
  total,
  streak = 0,
  color,
}: HabitProgressChartProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  const data = [
    { name: 'Completed', value: completed },
    { name: 'Remaining', value: remaining > 0 ? remaining : 0 },
  ];

  // Use custom color or fallback based on percentage
  const chartColor = color || (
    percentage >= 70 ? 'hsl(var(--primary))' :
    percentage >= 40 ? 'hsl(var(--amber))' :
    'hsl(var(--crimson))'
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {habitName}
              </h4>
              <CategoryBadge category={category} size="sm" />
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-amber">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-mono font-medium">{streak}d</span>
              </div>
            )}
          </div>

          <div className="relative h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill={chartColor} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold font-mono" style={{ color: chartColor }}>
                {percentage}%
              </span>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              {completed}/{total} days completed
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

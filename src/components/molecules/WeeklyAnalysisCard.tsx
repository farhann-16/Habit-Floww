import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Flame, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeeklyAnalysisCardProps {
  weeklyStats: {
    completionRate: number;
    previousWeekRate: number;
    totalCompleted: number;
    totalPossible: number;
    bestDay: string;
    worstDay: string;
    averagePerDay: number;
  };
}

export const WeeklyAnalysisCard = ({ weeklyStats }: WeeklyAnalysisCardProps) => {
  const {
    completionRate,
    previousWeekRate,
    totalCompleted,
    totalPossible,
    bestDay,
    worstDay,
    averagePerDay,
  } = weeklyStats;

  const trend = completionRate - previousWeekRate;
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-ocean/5 to-purple/5 border-ocean/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-ocean" />
            Weekly Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Rate */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold font-mono text-foreground">
                {completionRate}%
              </p>
              <p className="text-sm text-muted-foreground">Weekly completion</p>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                trendPositive && 'bg-primary/10 text-primary',
                trendNeutral && 'bg-muted text-muted-foreground',
                !trendPositive && !trendNeutral && 'bg-crimson/10 text-crimson'
              )}
            >
              {trendPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : trendNeutral ? (
                <Minus className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trendPositive ? '+' : ''}{trend}%</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">Completed</span>
              </div>
              <p className="font-mono font-bold text-lg">
                {totalCompleted}/{totalPossible}
              </p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-xs">Avg/Day</span>
              </div>
              <p className="font-mono font-bold text-lg">{averagePerDay}</p>
            </div>
          </div>

          {/* Best/Worst Days */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-primary">🏆</span>
              <span className="text-muted-foreground">Best:</span>
              <span className="font-medium">{bestDay}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-crimson">📉</span>
              <span className="text-muted-foreground">Focus:</span>
              <span className="font-medium">{worstDay}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Flame, CalendarDays, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MonthlyAnalysisCardProps {
  monthlyStats: {
    completionRate: number;
    previousMonthRate: number;
    totalCompleted: number;
    totalPossible: number;
    daysRemaining: number;
    projectedRate: number;
    bestStreak: number;
    perfectDays: number;
  };
}

export const MonthlyAnalysisCard = ({ monthlyStats }: MonthlyAnalysisCardProps) => {
  const {
    completionRate,
    previousMonthRate,
    totalCompleted,
    totalPossible,
    daysRemaining,
    projectedRate,
    bestStreak,
    perfectDays,
  } = monthlyStats;

  const trend = completionRate - previousMonthRate;
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 to-forest-light/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Monthly Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Rate with Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-3xl font-bold font-mono text-foreground">
                  {completionRate}%
                </p>
                <p className="text-sm text-muted-foreground">Monthly completion</p>
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
                <span>vs last month</span>
              </div>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">Total Done</span>
              </div>
              <p className="font-mono font-bold text-lg">
                {totalCompleted}/{totalPossible}
              </p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Days Left</span>
              </div>
              <p className="font-mono font-bold text-lg">{daysRemaining}</p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-xs">Best Streak</span>
              </div>
              <p className="font-mono font-bold text-lg">{bestStreak} days</p>
            </div>
            <div className="bg-background/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Award className="h-4 w-4" />
                <span className="text-xs">Perfect Days</span>
              </div>
              <p className="font-mono font-bold text-lg">{perfectDays}</p>
            </div>
          </div>

          {/* Projection */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <span className="text-muted-foreground">Projected end-of-month rate:</span>
            <span
              className={cn(
                'font-mono font-bold',
                projectedRate >= 70 ? 'text-primary' : projectedRate >= 40 ? 'text-amber' : 'text-crimson'
              )}
            >
              {projectedRate}%
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

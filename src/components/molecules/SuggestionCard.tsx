import { motion } from 'framer-motion';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface SuggestionCardProps {
  completionRate: number;
  todayCompleted: number;
  todayTotal: number;
  streak: number;
}

export const SuggestionCard = ({
  completionRate,
  todayCompleted,
  todayTotal,
  streak,
}: SuggestionCardProps) => {
  const getSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    if (todayCompleted < todayTotal) {
      const remaining = todayTotal - todayCompleted;
      suggestions.push({
        icon: <Target className="w-4 h-4" />,
        title: 'Complete Today',
        description: `${remaining} habit${remaining > 1 ? 's' : ''} left to finish today. Keep going!`,
        color: 'text-ocean',
      });
    }

    if (completionRate < 70) {
      suggestions.push({
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Boost Consistency',
        description: 'Try focusing on 2-3 key habits to build momentum.',
        color: 'text-amber',
      });
    }

    if (streak > 0 && streak < 7) {
      suggestions.push({
        icon: <Lightbulb className="w-4 h-4" />,
        title: 'Build Your Streak',
        description: `${7 - streak} more days to reach a week-long streak!`,
        color: 'text-purple',
      });
    }

    if (completionRate >= 70) {
      suggestions.push({
        icon: <Lightbulb className="w-4 h-4" />,
        title: 'Great Progress!',
        description: 'Consider adding a new habit to challenge yourself.',
        color: 'text-primary',
      });
    }

    return suggestions.slice(0, 3);
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card variant="insight">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple" />
            Suggestions
          </h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className={`mt-0.5 ${suggestion.color}`}>
                  {suggestion.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

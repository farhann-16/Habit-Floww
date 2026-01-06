import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  habitName?: string;
}

export const StreakCard = ({
  currentStreak,
  longestStreak,
  habitName,
}: StreakCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="streak" className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary-foreground/80">
              {habitName ? `${habitName} Streak` : 'Current Streak'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono">{currentStreak}</span>
              <span className="text-lg text-primary-foreground/80">days</span>
            </div>
            <p className="text-xs text-primary-foreground/60">
              Longest: {longestStreak} days
            </p>
          </div>
          
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="p-4 bg-primary-foreground/20 rounded-2xl"
          >
            <Flame className="w-10 h-10 text-primary-foreground" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

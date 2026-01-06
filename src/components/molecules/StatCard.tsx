import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'success' | 'ocean' | 'purple' | 'amber';
}

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-foreground',
    valueColor: 'text-foreground',
  },
  success: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  ocean: {
    iconBg: 'bg-ocean/10',
    iconColor: 'text-ocean',
    valueColor: 'text-ocean',
  },
  purple: {
    iconBg: 'bg-purple/10',
    iconColor: 'text-purple',
    valueColor: 'text-purple',
  },
  amber: {
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber',
    valueColor: 'text-amber',
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden h-full">
        <div className="flex items-start justify-between p-6 min-h-[140px]">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('text-3xl font-bold font-mono', styles.valueColor)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  'inline-flex items-center text-xs font-medium',
                  trend.positive ? 'text-primary' : 'text-destructive'
                )}
              >
                <span>{trend.positive ? '↑' : '↓'}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
                <span className="ml-1 text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', styles.iconBg)}>
            <Icon className={cn('w-6 h-6', styles.iconColor)} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

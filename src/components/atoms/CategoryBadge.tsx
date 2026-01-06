import { HabitCategory, CATEGORY_BG_COLORS } from '@/types/habit';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: HabitCategory;
  className?: string;
  size?: 'sm' | 'md';
}

export const CategoryBadge = ({ category, className, size = 'md' }: CategoryBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        CATEGORY_BG_COLORS[category],
        className
      )}
    >
      {category}
    </span>
  );
};

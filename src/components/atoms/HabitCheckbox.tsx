import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCheckboxProps {
  checked: boolean;
  onChange: () => void;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const HabitCheckbox = ({
  checked,
  onChange,
  loading = false,
  disabled = false,
  ariaLabel = 'Toggle habit completion',
  className,
}: HabitCheckboxProps) => {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      onClick={onChange}
      className={cn(
        'relative w-7 h-7 rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2',
        'hover:scale-110 active:scale-95',
        checked
          ? 'bg-primary border-primary shadow-success'
          : 'bg-card border-muted hover:border-sky',
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'animate-pulse',
        className
      )}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
      </motion.div>
    </motion.button>
  );
};

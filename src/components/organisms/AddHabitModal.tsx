import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { HabitCategory, HABIT_COLORS } from '@/types/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: {
    name: string;
    category: HabitCategory;
    monthlyTarget?: number;
    color?: string;
  }) => void;
}

const categories: HabitCategory[] = [
  'Health',
  'Career',
  'Productivity',
  'Personal',
];

const categoryStyles: Record<HabitCategory, string> = {
  Health: 'border-l-primary',
  Career: 'border-l-purple',
  Productivity: 'border-l-ocean',
  Personal: 'border-l-sunset',
};

export const AddHabitModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddHabitModalProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Health');
  const [monthlyTarget, setMonthlyTarget] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      monthlyTarget: monthlyTarget ? parseInt(monthlyTarget) : undefined,
      color: selectedColor,
    });

    // Reset form
    setName('');
    setCategory('Health');
    setMonthlyTarget('');
    setSelectedColor(HABIT_COLORS[0].value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-deep/60 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'w-full max-w-md bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden flex flex-col',
                'border-l-4 max-h-[90vh]',
                categoryStyles[category]
              )}
            >
              {/* Header - Fixed */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h2 className="text-xl font-heading font-semibold">
                  Add New Habit
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <form id="add-habit-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="habit-name">Habit Name</Label>
                    <Input
                      id="habit-name"
                      placeholder="e.g., Morning Meditation"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={category}
                      onValueChange={(value) =>
                        setCategory(value as HabitCategory)
                      }
                    >
                      <SelectTrigger id="category" className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Picker */}
                  <div className="space-y-2">
                    <Label>Habit Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {HABIT_COLORS.map((color) => (
                        <motion.button
                          key={color.value}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedColor(color.value)}
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                            'ring-2 ring-offset-2 ring-offset-card',
                            selectedColor === color.value
                              ? 'ring-foreground'
                              : 'ring-transparent hover:ring-muted-foreground/50'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {selectedColor === color.value && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target">
                      Monthly Target{' '}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="e.g., 20 days"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(e.target.value)}
                      min={1}
                      max={31}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Aim for consistency, not perfection.
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer - Fixed */}
              <div className="p-6 border-t border-border bg-card shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    form="add-habit-form"
                    variant="success"
                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-success/20 hover:scale-[1.02] transition-all"
                    disabled={!name.trim()}
                  >
                    Confirm & Add Habit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="w-full h-12 text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

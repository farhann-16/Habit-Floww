import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, TrendingUp, History, MoreVertical, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Goal } from '@/types/goal';
import { AddGoalModal } from '@/components/organisms/AddGoalModal';
import { AddGoalEntryModal } from '@/components/organisms/AddGoalEntryModal';
import { cn } from '@/lib/utils';

export const GoalsPage = () => {
    const { toast } = useToast();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    const fetchGoals = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.get('/goals');
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
            toast({
                title: 'Error',
                description: 'Failed to load goals.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal? All progress will be lost.')) return;
        try {
            await api.delete(`/goals/${id}`);
            setGoals(prev => prev.filter(g => g.id !== id));
            toast({ title: 'Goal deleted' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete goal', variant: 'destructive' });
        }
    };

    return (
        <AppLayout onAddHabit={() => setIsAddModalOpen(true)}>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                            <Target className="w-8 h-8 text-primary" />
                            Goal Tracking
                        </h1>
                        <p className="text-muted-foreground">
                            Set big targets and track your progress over time.
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="success" className="gap-2">
                        <Plus className="w-5 h-5" />
                        New Goal
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-[40vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : goals.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/30">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <Target className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                Start by creating a goal like "Save $10,000" or "Reach 70kg weight".
                            </p>
                            <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
                                Create your first goal
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {goals.map((goal, index) => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    index={index}
                                    onAddEntry={() => {
                                        setSelectedGoal(goal);
                                        setIsEntryModalOpen(true);
                                    }}
                                    onDelete={() => handleDeleteGoal(goal.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AddGoalModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchGoals}
            />

            {selectedGoal && (
                <AddGoalEntryModal
                    goal={selectedGoal}
                    isOpen={isEntryModalOpen}
                    onClose={() => setIsEntryModalOpen(false)}
                    onSuccess={fetchGoals}
                />
            )}
        </AppLayout>
    );
};

const GoalCard = ({ goal, index, onAddEntry, onDelete }: { goal: Goal; index: number; onAddEntry: () => void; onDelete: () => void }) => {
    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden relative">
                {/* Accent Color Bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: goal.color || 'var(--primary)' }}
                />

                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                {goal.name}
                            </CardTitle>
                            <CardDescription>
                                {goal.type === 'CUMULATIVE' ? 'Sum of all logs' : 'Latest entry tracker'}
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-bold">{progress}%</span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: goal.color || 'var(--primary)',
                                    boxShadow: `0 0 10px ${goal.color || 'var(--primary)'}40`
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                            <span>{goal.current.toLocaleString()} {goal.unit}</span>
                            <span>Target: {goal.target.toLocaleString()} {goal.unit}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="flex-1 gap-2"
                            variant="secondary"
                            onClick={onAddEntry}
                        >
                            <Plus className="w-4 h-4" />
                            Add Progress
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <History className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

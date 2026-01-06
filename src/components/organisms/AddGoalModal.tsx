import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { HABIT_COLORS } from '@/types/habit';
import { cn } from '@/lib/utils';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddGoalModal = ({ isOpen, onClose, onSuccess }: AddGoalModalProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        target: '',
        unit: '',
        type: 'CUMULATIVE' as 'CUMULATIVE' | 'ABSOLUTE',
        color: HABIT_COLORS[0].value,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.target) return;

        try {
            setIsLoading(true);
            await api.post('/goals', {
                ...formData,
                target: Number(formData.target),
            });
            toast({ title: 'Goal created!', description: `"${formData.name}" has been added.` });
            onSuccess();
            onClose();
            setFormData({ name: '', target: '', unit: '', type: 'CUMULATIVE', color: HABIT_COLORS[0].value });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create goal', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Goal</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Goal Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Save Money, Weight Loss"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target">Target Value</Label>
                                <Input
                                    id="target"
                                    type="number"
                                    placeholder="10000"
                                    value={formData.target}
                                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Input
                                    id="unit"
                                    placeholder="e.g. $, kg, pts"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tracking Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CUMULATIVE">Cumulative (Sums up entries)</SelectItem>
                                    <SelectItem value="ABSOLUTE">Absolute (Latest entry is value)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Goal Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {HABIT_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-all",
                                            formData.color === color.value ? "border-foreground scale-110" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Goal } from '@/types/goal';

interface AddGoalEntryModalProps {
    goal: Goal;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddGoalEntryModal = ({ goal, isOpen, onClose, onSuccess }: AddGoalEntryModalProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        try {
            setIsLoading(true);
            await api.post(`/goals/${goal.id}/logs`, {
                value: Number(value),
                note,
                date: new Date().toISOString(),
            });
            toast({ title: 'Entry added!', description: `Progress updated for "${goal.name}".` });
            onSuccess();
            onClose();
            setValue('');
            setNote('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add entry', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Entry for {goal.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="value">
                                {goal.type === 'CUMULATIVE' ? 'Amount to add' : 'Current absolute value'} ({goal.unit})
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                step="any"
                                placeholder={`e.g. ${goal.type === 'CUMULATIVE' ? '50' : '65'}`}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note">Note (Optional)</Label>
                            <Input
                                id="note"
                                placeholder="Added some savings..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} variant="success">
                            {isLoading ? 'Adding...' : 'Add Entry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

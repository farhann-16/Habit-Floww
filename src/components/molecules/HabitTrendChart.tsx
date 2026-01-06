import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit } from '@/types/habit';

interface HabitTrendChartProps {
    data: any[];
    habits: Habit[];
    title?: string;
}

export const HabitTrendChart = ({
    data,
    habits,
    title = 'Habit Trends',
}: HabitTrendChartProps) => {
    // Extract all habit names from the first data point if available
    const habitNames = habits.map(h => h.name);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--border))"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 100]}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-lg)',
                                    color: 'hsl(var(--foreground))',
                                    padding: '12px'
                                }}
                                labelFormatter={(label) => {
                                    const date = new Date(label);
                                    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                                }}
                                formatter={(val: number, name: string) => [`${val}%`, name]}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '10px' }}
                                iconType="circle"
                                fontSize={12}
                            />
                            {habits.map((habit, index) => (
                                <Line
                                    key={habit.id}
                                    type="monotone"
                                    dataKey={habit.name}
                                    stroke={habit.color || `hsl(${index * 45}, 70%, 50%)`}
                                    strokeWidth={2}
                                    dot={{ r: 3, strokeWidth: 2, fill: 'white' }}
                                    activeDot={{ r: 5, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

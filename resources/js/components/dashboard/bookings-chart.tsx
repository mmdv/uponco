import { TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardTrendDay } from '@/types';

type Props = {
    trend: DashboardTrendDay[];
    mounted: boolean;
};

export default function BookingsChart({ trend, mounted }: Props) {
    const total = trend.reduce((sum, day) => sum + day.count, 0);
    const max = Math.max(...trend.map((day) => day.count), 1);

    return (
        <Card className="max-w-full overflow-hidden">
            <CardContent className="space-y-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-medium">The week ahead</h3>
                        <p className="text-sm text-muted-foreground">
                            Bookings scheduled over the next 7 days.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
                        <TrendingUp className="size-4" />
                        {total} booked
                    </div>
                </div>

                <div className="flex items-end gap-2 sm:gap-3">
                    {trend.map((day, index) => {
                        const ratio = day.count > 0 ? day.count / max : 0;

                        return (
                            <div
                                key={day.date}
                                className="group/bar flex flex-1 flex-col items-center gap-2"
                            >
                                <span
                                    className={cn(
                                        'text-xs font-semibold tabular-nums transition-colors',
                                        day.count > 0
                                            ? 'text-foreground'
                                            : 'text-muted-foreground/50',
                                    )}
                                >
                                    {day.count}
                                </span>
                                <div className="flex h-28 w-full items-end">
                                    <div className="relative w-full overflow-hidden rounded-lg bg-muted/40">
                                        <div
                                            className={cn(
                                                'w-full rounded-lg bg-gradient-to-t transition-[height] duration-700 ease-out',
                                                day.isToday
                                                    ? 'from-[#0063ff] to-[#3884fe] shadow-[0_0_20px_-4px] shadow-primary/40'
                                                    : 'from-primary/60 to-[#3884fe]/60 group-hover/bar:from-[#0063ff] group-hover/bar:to-[#3884fe]',
                                            )}
                                            style={{
                                                height: mounted
                                                    ? `${Math.max(ratio * 112, day.count > 0 ? 10 : 4)}px`
                                                    : '0px',
                                                transitionDelay: `${index * 60}ms`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span
                                    className={cn(
                                        'text-[11px] font-medium',
                                        day.isToday
                                            ? 'text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {day.isToday ? 'Today' : day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

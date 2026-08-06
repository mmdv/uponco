import { TrendingUp } from 'lucide-react';

import { ACCENTS } from '@/components/accents';
import { TrendGraphic } from '@/components/card-graphics';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { DashboardTrendDay } from '@/types';

type Props = {
    trend: DashboardTrendDay[];
    mounted: boolean;
};

/** The week-ahead chart carries the violet accent across the dashboard. */
const STYLES = ACCENTS.ink;

export default function BookingsChart({ trend, mounted }: Props) {
    const { t } = useTranslation('dashboard');
    const total = trend.reduce((sum, day) => sum + day.count, 0);
    const max = Math.max(...trend.map((day) => day.count), 1);

    return (
        <Card className="relative max-w-full overflow-hidden border-black/[0.08]">
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
                    STYLES.wash,
                )}
            />
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 overflow-hidden',
                    STYLES.graphic,
                )}
            >
                <TrendGraphic />
            </div>

            <CardContent className="relative space-y-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-semibold">
                            {t('chart.title')}
                        </h3>
                        <p className="text-sm font-medium text-foreground/70">
                            {t('chart.subtitle')}
                        </p>
                    </div>
                    {/*
                        Phones only get the count; the "booked" wording would
                        push the badge into the title beside it.
                    */}
                    <div
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold',
                            STYLES.soft,
                            STYLES.text,
                        )}
                    >
                        <TrendingUp className="size-4" />
                        <span className="tabular-nums md:hidden">{total}</span>
                        <span className="hidden md:inline">
                            {t('chart.booked', { count: total })}
                        </span>
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
                                            : 'text-foreground/35',
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
                                                    ? 'from-[#0063ff] to-[#3884fe] shadow-[0_0_20px_-4px] shadow-[#0063ff]/45'
                                                    : 'from-[#0063ff]/45 to-[#3884fe]/45 group-hover/bar:from-[#0063ff] group-hover/bar:to-[#3884fe]',
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
                                            ? 'font-semibold text-foreground'
                                            : 'text-foreground/65',
                                    )}
                                >
                                    {day.isToday ? t('chart.today') : day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

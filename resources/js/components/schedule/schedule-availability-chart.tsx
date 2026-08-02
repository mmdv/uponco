import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { ScheduleSummary } from '@/types';

function formatHours(minutes: number): string {
    const hours = minutes / 60;

    return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

type Props = {
    schedule: ScheduleSummary;
    mounted: boolean;
};

/**
 * The 7-day availability visualization — a small bar per day plus an
 * "open now / hours this week" status line. Shared by the company overview
 * card and the member dashboard so both stay in sync.
 */
export default function ScheduleAvailabilityChart({ schedule, mounted }: Props) {
    const { t } = useTranslation('company');
    const maxMinutes = Math.max(...schedule.days.map((day) => day.minutes), 1);

    return (
        <>
            <div className="mt-6 flex items-end gap-2 sm:gap-3">
                {schedule.days.map((day, index) => {
                    const ratio =
                        day.minutes > 0
                            ? Math.max(day.minutes / maxMinutes, 0.12)
                            : 0;

                    return (
                        <div
                            key={day.key}
                            className="flex flex-1 flex-col items-center gap-2"
                        >
                            <div className="flex h-16 w-full items-end">
                                <div className="relative w-full overflow-hidden rounded-md bg-muted/50">
                                    <div
                                        className={cn(
                                            'w-full rounded-md transition-[height] duration-700 ease-out',
                                            day.isToday
                                                ? 'bg-gradient-to-t from-[#0063ff] to-[#3884fe]'
                                                : 'bg-primary/40',
                                        )}
                                        style={{
                                            height: mounted
                                                ? `${Math.max(ratio * 64, day.minutes > 0 ? 8 : 4)}px`
                                                : '0px',
                                            transitionDelay: `${index * 50}ms`,
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
                                {day.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
                <span
                    className={cn(
                        'relative flex size-2 rounded-full',
                        schedule.openNow
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/40',
                    )}
                >
                    {schedule.openNow && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                </span>
                <span className="text-muted-foreground">
                    {schedule.openNow
                        ? t('schedule.openNow')
                        : t('schedule.closedNow')}{' '}
                    ·{' '}
                    {t('schedule.hoursOverWeek', {
                        hours: formatHours(schedule.totalMinutes),
                    })}
                </span>
            </div>
        </>
    );
}

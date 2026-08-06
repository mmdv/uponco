import { Link } from '@inertiajs/react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ACCENTS } from '@/components/accents';
import { ScheduleGraphic } from '@/components/card-graphics';
import ScheduleAvailabilityChart from '@/components/schedule/schedule-availability-chart';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as scheduleIndex } from '@/routes/schedule';
import type { ScheduleSummary } from '@/types';

/** Teal, matching the schedule tile on the company page. */
const STYLES = ACCENTS.bright;

type Props = {
    schedule: ScheduleSummary;
};

/**
 * Members' replacement for the company hub card: a link to their schedule that
 * previews the next 7 days of availability. Mirrors the company page's schedule
 * tile so the two stay visually aligned.
 */
export default function ScheduleCard({ schedule }: Props) {
    const { t } = useTranslation('company');

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <Link
            href={scheduleIndex()}
            data-test="dashboard-schedule"
            className={cn(
                'group relative flex max-w-full flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-card p-5 text-card-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6 dark:border-border',
                STYLES.ring,
            )}
        >
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
                <ScheduleGraphic />
            </div>

            <div className="relative flex items-start gap-3">
                <span
                    className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105',
                        STYLES.gradient,
                        STYLES.shadow,
                    )}
                >
                    <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="truncate text-base font-semibold">
                        {t('schedule.title')}
                    </h3>
                    <p className="text-sm font-medium text-foreground/75">
                        {t('schedule.description')}
                    </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>

            <div className="relative mt-6">
                <ScheduleAvailabilityChart
                    schedule={schedule}
                    mounted={mounted}
                />
            </div>
        </Link>
    );
}

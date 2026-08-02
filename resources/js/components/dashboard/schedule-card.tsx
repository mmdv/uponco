import { Link } from '@inertiajs/react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import ScheduleAvailabilityChart from '@/components/schedule/schedule-availability-chart';
import { useTranslation } from '@/hooks/use-translation';
import { index as scheduleIndex } from '@/routes/schedule';
import type { ScheduleSummary } from '@/types';

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
            className="group flex max-w-full flex-col rounded-2xl border border-[#f1f3f5] bg-card p-5 text-card-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 sm:p-6 dark:border-border"
        >
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="truncate text-base font-medium">
                        {t('schedule.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('schedule.description')}
                    </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>

            <ScheduleAvailabilityChart schedule={schedule} mounted={mounted} />
        </Link>
    );
}

import { Plus } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { dateKey } from '@/lib/calendar-grid';
import {
    formatHours,
    isPastDay,
    totalSlotMinutes,
} from '@/lib/member-schedule';
import { cn } from '@/lib/utils';
import type { ScheduleSlot } from '@/types/schedule';
import type { MemberScheduleController } from './use-member-schedule';

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

type MemberWeekViewProps = {
    schedule: MemberScheduleController;
    onEditDay: (dayKeys: string[]) => void;
};

/**
 * The week at a glance: seven stacked rows on mobile, seven columns on desktop.
 * Neither layout scrolls sideways, so the whole week is always in view — the
 * thing the month-wide team grid cannot do.
 */
export default function MemberWeekView({
    schedule,
    onEditDay,
}: MemberWeekViewProps) {
    const { days, slotsFor, isLoading } = schedule;

    if (isLoading) {
        return (
            <div className="grid gap-2 lg:grid-cols-7">
                {days.map((day) => (
                    <Skeleton
                        key={dateKey(day)}
                        className="h-24 w-full animate-pulse lg:h-40"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-2 lg:grid-cols-7">
            {days.map((day) => (
                <WeekDayCard
                    key={dateKey(day)}
                    day={day}
                    slots={slotsFor(day)}
                    onEdit={() => onEditDay([dateKey(day)])}
                />
            ))}
        </div>
    );
}

type WeekDayCardProps = {
    day: Date;
    slots: ScheduleSlot[];
    onEdit: () => void;
};

function WeekDayCard({ day, slots, onEdit }: WeekDayCardProps) {
    const { t } = useTranslation('schedule');
    const key = dateKey(day);
    const isPast = isPastDay(day);
    const isToday = key === dateKey(new Date());
    const hasSlots = slots.length > 0;

    return (
        <button
            type="button"
            disabled={isPast}
            onClick={onEdit}
            aria-label={`${weekdayFormatter.format(day)} ${day.getDate()}`}
            className={cn(
                'flex w-full flex-row items-center gap-3 rounded-lg border p-3 text-left transition-colors lg:h-40 lg:flex-col lg:items-stretch',
                isPast
                    ? 'cursor-not-allowed border-border/60 bg-muted/40 opacity-60'
                    : 'hover:border-primary/40 hover:bg-muted/40',
                isToday && !isPast && 'border-primary',
            )}
        >
            <div className="flex w-20 shrink-0 items-baseline gap-1.5 lg:w-auto lg:justify-between">
                <span
                    className={cn(
                        'text-xs font-medium',
                        isToday ? 'text-primary' : 'text-muted-foreground',
                    )}
                >
                    {weekdayFormatter.format(day)}
                </span>
                <span
                    className={cn(
                        'text-lg leading-none font-semibold tabular-nums',
                        isToday && 'text-primary',
                    )}
                >
                    {day.getDate()}
                </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap content-start gap-1 lg:flex-col lg:flex-nowrap lg:overflow-hidden">
                {hasSlots ? (
                    slots.map((slot, index) => (
                        <span
                            key={index}
                            className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 tabular-nums lg:text-center dark:bg-emerald-500/25 dark:text-emerald-200"
                        >
                            {slot.start}–{slot.end}
                        </span>
                    ))
                ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {!isPast && <Plus className="h-3 w-3" />}
                        {t('member.dayOff')}
                    </span>
                )}
            </div>

            {hasSlots && (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums lg:mt-auto lg:text-center">
                    {formatHours(totalSlotMinutes(slots))}
                </span>
            )}
        </button>
    );
}

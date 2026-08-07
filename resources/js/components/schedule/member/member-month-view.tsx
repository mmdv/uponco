import { Check } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { dateKey, weekDays } from '@/lib/calendar-grid';
import {
    formatHours,
    isPastDay,
    totalSlotMinutes,
} from '@/lib/member-schedule';
import { cn } from '@/lib/utils';
import type { ScheduleSlot } from '@/types/schedule';
import type { MemberScheduleController } from './use-member-schedule';

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'narrow',
});

/** Weekday headers, Mon–Sun, from a known week so the labels stay localised. */
const WEEKDAY_LABELS = weekDays(new Date()).map((day) =>
    weekdayFormatter.format(day),
);

type MemberMonthViewProps = {
    schedule: MemberScheduleController;
};

/**
 * The whole month as a real calendar — six Mon-start weeks, so the shape of a
 * month is visible at a glance instead of as a scrolling strip. Tapping days
 * selects them; the parent turns a selection into one edit.
 */
export default function MemberMonthView({ schedule }: MemberMonthViewProps) {
    const { anchor, days, slotsFor, isLoading, selectedDays, toggleDay } =
        schedule;

    if (isLoading) {
        return <Skeleton className="h-[26rem] w-full animate-pulse" />;
    }

    return (
        <div>
            <div className="grid grid-cols-7 gap-1 pb-1">
                {WEEKDAY_LABELS.map((label, index) => (
                    <span
                        key={index}
                        className="text-center text-xs font-medium text-muted-foreground"
                    >
                        {label}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const key = dateKey(day);

                    return (
                        <MonthDayCell
                            key={key}
                            day={day}
                            slots={slotsFor(day)}
                            isOutsideMonth={
                                day.getMonth() !== anchor.getMonth()
                            }
                            isSelected={selectedDays.has(key)}
                            onToggle={() => toggleDay(key)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

type MonthDayCellProps = {
    day: Date;
    slots: ScheduleSlot[];
    isOutsideMonth: boolean;
    isSelected: boolean;
    onToggle: () => void;
};

function MonthDayCell({
    day,
    slots,
    isOutsideMonth,
    isSelected,
    onToggle,
}: MonthDayCellProps) {
    const { t } = useTranslation('schedule');
    const isPast = isPastDay(day);
    const isToday = dateKey(day) === dateKey(new Date());
    const hasSlots = slots.length > 0;

    return (
        <button
            type="button"
            disabled={isPast}
            aria-pressed={isSelected}
            onClick={onToggle}
            className={cn(
                'flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border p-1 transition-colors sm:aspect-[4/3]',
                isPast
                    ? 'cursor-not-allowed border-transparent bg-muted/40 opacity-50'
                    : isSelected
                      ? 'border-sky-400 bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-200'
                      : 'border-border/60 hover:bg-muted/60',
                !isPast &&
                    !isSelected &&
                    hasSlots &&
                    'bg-emerald-50 dark:bg-emerald-500/10',
                isOutsideMonth && !isSelected && 'opacity-40',
                isToday && !isSelected && 'border-primary',
            )}
        >
            <span
                className={cn(
                    'text-xs leading-none font-semibold tabular-nums',
                    isToday && !isSelected && 'text-primary',
                )}
            >
                {day.getDate()}
            </span>

            {isSelected ? (
                <Check className="h-3.5 w-3.5" />
            ) : hasSlots ? (
                <>
                    <span className="w-full truncate text-center text-[10px] leading-tight text-emerald-700 tabular-nums dark:text-emerald-200">
                        {slots.length === 1
                            ? `${slots[0].start}–${slots[0].end}`
                            : formatHours(totalSlotMinutes(slots))}
                    </span>
                    {slots.length > 1 && (
                        <span className="text-[9px] leading-none text-emerald-700/80 dark:text-emerald-300/80">
                            {t('member.blockCount', { count: slots.length })}
                        </span>
                    )}
                </>
            ) : null}
        </button>
    );
}

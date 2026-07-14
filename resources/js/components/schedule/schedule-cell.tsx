import { Check } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { cellId } from '@/lib/schedule';
import { cn } from '@/lib/utils';
import type { DayColumn } from '@/types/schedule';
import { DAY_CELL_CLASS, ROW_HEIGHT_CLASS } from './grid-layout';
import { useSchedule } from './schedule-context';

type ScheduleCellProps = {
    memberId: number;
    column: DayColumn;
};

/** Slot chips shown before collapsing the rest into a "+N more" line. */
const MAX_VISIBLE_SLOTS = 3;

/**
 * A single member/day cell. Tapping toggles its selection; selected cells get a
 * light-blue fill. Scheduled days show their time blocks as start–end chips.
 */
export default function ScheduleCell({ memberId, column }: ScheduleCellProps) {
    const { t } = useTranslation('schedule');
    const { isSelected, toggleCell, cellSlots } = useSchedule();
    const id = cellId(memberId, column.key);
    const isPast = column.isPast;
    const selected = !isPast && isSelected(id);
    const slots = cellSlots(id);
    const hasSlots = slots.length > 0;
    const visibleSlots = slots.slice(0, MAX_VISIBLE_SLOTS);
    const hiddenCount = slots.length - visibleSlots.length;

    return (
        <button
            type="button"
            disabled={isPast}
            aria-pressed={selected}
            aria-label={`${column.dayNumber} ${column.weekday}${
                isPast ? t('cell.pastDaySuffix') : ''
            }${
                hasSlots
                    ? t('cell.timeBlocksSuffix', {
                          count: slots.length,
                          blockWord: t(
                              slots.length === 1
                                  ? 'cell.timeBlockSingular'
                                  : 'cell.timeBlockPlural',
                          ),
                      })
                    : ''
            }`}
            onClick={() => {
                if (!isPast) {
                    toggleCell(id);
                }
            }}
            className={cn(
                DAY_CELL_CLASS,
                ROW_HEIGHT_CLASS,
                'flex flex-col items-center justify-center gap-0.5 overflow-hidden border-r border-b border-border/60 px-1 transition-colors',
                isPast
                    ? 'cursor-not-allowed bg-muted/40 opacity-50'
                    : selected
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-200'
                      : 'hover:bg-muted/60',
                !isPast &&
                    !selected &&
                    hasSlots &&
                    'bg-emerald-50 dark:bg-emerald-500/10',
                column.isToday && !selected && !hasSlots && 'bg-primary/5',
            )}
        >
            {selected ? (
                <Check className="h-4 w-4" />
            ) : hasSlots ? (
                <>
                    {visibleSlots.map((slot, index) => (
                        <span
                            key={index}
                            className="w-full truncate rounded bg-emerald-100 px-1 text-center text-[10px] leading-tight font-medium text-emerald-700 tabular-nums dark:bg-emerald-500/25 dark:text-emerald-200"
                        >
                            {slot.start}–{slot.end}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="text-[9px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
                            {t('cell.moreCount', { count: hiddenCount })}
                        </span>
                    )}
                </>
            ) : null}
        </button>
    );
}

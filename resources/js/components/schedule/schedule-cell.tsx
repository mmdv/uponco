import { Check } from 'lucide-react';

import { cellId } from '@/lib/schedule';
import { cn } from '@/lib/utils';
import type { DayColumn } from '@/types/schedule';
import { DAY_CELL_CLASS, ROW_HEIGHT_CLASS } from './grid-layout';
import { useSchedule } from './schedule-context';

type ScheduleCellProps = {
    memberId: number;
    column: DayColumn;
};

/**
 * A single member/day cell. Tapping toggles its selection; selected cells get a
 * light-blue fill so multi-selection reads at a glance.
 */
export default function ScheduleCell({ memberId, column }: ScheduleCellProps) {
    const { isSelected, toggleCell } = useSchedule();
    const id = cellId(memberId, column.key);
    const selected = isSelected(id);

    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={`${column.dayNumber} ${column.weekday}`}
            onClick={() => toggleCell(id)}
            className={cn(
                DAY_CELL_CLASS,
                ROW_HEIGHT_CLASS,
                'flex items-center justify-center border-r border-b border-border/60 transition-colors',
                selected
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-200'
                    : 'hover:bg-muted/60',
                column.isToday && !selected && 'bg-primary/5',
            )}
        >
            {selected && <Check className="h-4 w-4" />}
        </button>
    );
}

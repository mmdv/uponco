import { cn } from '@/lib/utils';
import type { DayColumn } from '@/types/schedule';
import { DAY_CELL_CLASS, HEADER_HEIGHT_CLASS } from './grid-layout';

type ScheduleGridHeaderProps = {
    columns: DayColumn[];
};

/**
 * The day columns header: each cell stacks the day number over the weekday
 * (e.g. `10` / `Fri`). Lives inside the scrollable day area.
 */
export default function ScheduleGridHeader({
    columns,
}: ScheduleGridHeaderProps) {
    return (
        <div className="flex">
            {columns.map((column) => (
                <div
                    key={column.key}
                    className={cn(
                        DAY_CELL_CLASS,
                        HEADER_HEIGHT_CLASS,
                        'flex flex-col items-center justify-center gap-0.5 border-r border-b border-border/60',
                        column.isToday && 'bg-primary/5',
                    )}
                >
                    <span
                        className={cn(
                            'text-sm font-semibold',
                            column.isToday && 'text-primary',
                        )}
                    >
                        {column.dayNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                        {column.weekday}
                    </span>
                </div>
            ))}
        </div>
    );
}

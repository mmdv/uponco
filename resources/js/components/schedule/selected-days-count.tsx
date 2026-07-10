import { cn } from '@/lib/utils';
import { useSchedule } from './schedule-context';

type SelectedDaysCountProps = {
    className?: string;
};

/**
 * The "N days selected" count, shown top-right on both mobile and desktop.
 */
export default function SelectedDaysCount({
    className,
}: SelectedDaysCountProps) {
    const { selectedDayCount } = useSchedule();

    return (
        <span
            className={cn('text-sm text-muted-foreground', className)}
            aria-live="polite"
        >
            {selectedDayCount} {selectedDayCount === 1 ? 'day' : 'days'}{' '}
            selected
        </span>
    );
}

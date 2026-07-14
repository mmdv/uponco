import { useTranslation } from '@/hooks/use-translation';
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
    const { t } = useTranslation('schedule');
    const { selectedDayCount } = useSchedule();

    return (
        <span
            className={cn('text-sm text-muted-foreground', className)}
            aria-live="polite"
        >
            {t('daysSelected', {
                count: selectedDayCount,
                dayWord: t(
                    selectedDayCount === 1 ? 'daySingular' : 'dayPlural',
                ),
            })}
        </span>
    );
}

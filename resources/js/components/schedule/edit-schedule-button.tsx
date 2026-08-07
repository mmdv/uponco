import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useSchedule } from './schedule-context';

type EditScheduleButtonProps = {
    className?: string;
    /**
     * Carry the selected-day count as a badge on the button itself, for
     * layouts too tight to also fit the separate "N days selected" line.
     */
    showCount?: boolean;
};

/**
 * Opens the Edit Schedule drawer. Disabled until at least one day is selected.
 * Placed in the header on desktop and full-width in the bottom bar on mobile.
 */
export default function EditScheduleButton({
    className,
    showCount = false,
}: EditScheduleButtonProps) {
    const { t } = useTranslation('schedule');
    const { selectedDayCount, openDrawer } = useSchedule();

    return (
        <Button
            type="button"
            size="sm"
            disabled={selectedDayCount === 0}
            onClick={openDrawer}
            className={cn(className)}
        >
            <CalendarClock className="h-4 w-4" />
            {t('editSchedule')}

            {showCount && (
                <>
                    {selectedDayCount > 0 && (
                        <span
                            aria-hidden="true"
                            className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs leading-none font-semibold tabular-nums"
                        >
                            {selectedDayCount}
                        </span>
                    )}

                    {/* The live region is always mounted — one that appears
                        along with the count would not be announced. */}
                    <span className="sr-only" aria-live="polite">
                        {t('daysSelected', {
                            count: selectedDayCount,
                            dayWord: t(
                                selectedDayCount === 1
                                    ? 'daySingular'
                                    : 'dayPlural',
                            ),
                        })}
                    </span>
                </>
            )}
        </Button>
    );
}

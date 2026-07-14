import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { useSchedule } from './schedule-context';

type EditScheduleButtonProps = {
    className?: string;
};

/**
 * Opens the Edit Schedule drawer. Disabled until at least one day is selected.
 * Placed in the header on desktop and full-width in the bottom bar on mobile.
 */
export default function EditScheduleButton({
    className,
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
        </Button>
    );
}

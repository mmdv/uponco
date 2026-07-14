import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import TimeSlotRow from '@/components/work-hours/time-slot-row';
import { useTranslation } from '@/hooks/use-translation';
import type { ScheduleSlot } from '@/types/schedule';
import type { DayKey } from '@/types/work-hours';

// TimeSlotRow is keyed by weekday; the shared editor has no single day, so a
// placeholder is passed and ignored by the handlers below.
const PLACEHOLDER_DAY: DayKey = 'monday';

type ScheduleSlotEditorProps = {
    slots: ScheduleSlot[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: 'start' | 'end', value: string) => void;
};

/**
 * The shared time-block editor shown in the Edit Schedule drawer. A single list
 * of slots applied to every selected day. Controlled by the drawer, which owns
 * the slot state so it can pre-fill from an already-scheduled day and submit it.
 */
export default function ScheduleSlotEditor({
    slots,
    onAdd,
    onRemove,
    onUpdate,
}: ScheduleSlotEditorProps) {
    const { t } = useTranslation('schedule');

    return (
        <div className="space-y-3">
            {slots.map((slot, index) => (
                <TimeSlotRow
                    key={index}
                    day={PLACEHOLDER_DAY}
                    index={index}
                    slot={slot}
                    onUpdate={(_day, slotIndex, field, value) =>
                        onUpdate(slotIndex, field, value)
                    }
                    onRemove={(_day, slotIndex) => onRemove(slotIndex)}
                />
            ))}

            <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4" />
                {t('slotEditor.addTimeBlock')}
            </Button>
        </div>
    );
}

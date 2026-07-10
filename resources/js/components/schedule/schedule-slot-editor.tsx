import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import TimeSlotRow from '@/components/work-hours/time-slot-row';
import type { DayKey, TimeSlot } from '@/types/work-hours';

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

// TimeSlotRow is keyed by weekday; the shared editor has no single day, so a
// placeholder is passed and ignored by the handlers below.
const PLACEHOLDER_DAY: DayKey = 'monday';

/**
 * The shared time-block editor shown in the Edit Schedule drawer. A single list
 * of slots that will conceptually apply to every selected day. Local-only state
 * for now — nothing is persisted.
 */
export default function ScheduleSlotEditor() {
    const [slots, setSlots] = useState<TimeSlot[]>([{ ...DEFAULT_SLOT }]);

    const addSlot = (): void => {
        setSlots((current) => [...current, { start: '', end: '' }]);
    };

    const removeSlot = (_day: DayKey, index: number): void => {
        setSlots((current) =>
            current.filter((_, slotIndex) => slotIndex !== index),
        );
    };

    const updateSlot = (
        _day: DayKey,
        index: number,
        field: 'start' | 'end',
        value: string,
    ): void => {
        setSlots((current) =>
            current.map((slot, slotIndex) =>
                slotIndex === index ? { ...slot, [field]: value } : slot,
            ),
        );
    };

    return (
        <div className="space-y-3">
            {slots.map((slot, index) => (
                <TimeSlotRow
                    key={index}
                    day={PLACEHOLDER_DAY}
                    index={index}
                    slot={slot}
                    onUpdate={updateSlot}
                    onRemove={removeSlot}
                />
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                <Plus className="h-4 w-4" />
                Add Time Block
            </Button>
        </div>
    );
}

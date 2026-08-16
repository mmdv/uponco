import { Plus } from 'lucide-react';
import { Button, TimeSlotRow } from 'uponco';

const noop = () => undefined;

/** One working block in the Edit Schedule drawer. */
export function Default() {
    return (
        <TimeSlotRow
            day="monday"
            index={0}
            slot={{ start: '09:00', end: '13:00' }}
            onUpdate={noop}
            onRemove={noop}
        />
    );
}

/** A split day — morning and afternoon blocks with the add button below. */
export function SplitDay() {
    return (
        <div className="max-w-md space-y-3">
            <TimeSlotRow
                day="tuesday"
                index={0}
                slot={{ start: '09:00', end: '13:00' }}
                onUpdate={noop}
                onRemove={noop}
            />
            <TimeSlotRow
                day="tuesday"
                index={1}
                slot={{ start: '14:30', end: '19:00' }}
                onUpdate={noop}
                onRemove={noop}
            />
            <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Add time block
            </Button>
        </div>
    );
}

/** Validation rejected the block: the end time is before the start. */
export function WithErrors() {
    return (
        <div className="max-w-md">
            <TimeSlotRow
                day="wednesday"
                index={0}
                slot={{ start: '18:00', end: '09:00' }}
                startError="Overlaps the previous block."
                endError="The end time must be after the start time."
                onUpdate={noop}
                onRemove={noop}
            />
        </div>
    );
}

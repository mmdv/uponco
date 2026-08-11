import { Minus, Plus } from 'lucide-react';

import NumericInput from '@/components/numeric-input';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/appointments';

type Props = {
    /** Current duration in minutes. */
    value: number;
    onChange: (value: number) => void;
    /** Smallest allowed duration. */
    min?: number;
    max?: number;
    id?: string;
    invalid?: boolean;
};

/** The 15-minute step the +/- buttons snap to. */
const STEP = 15;

/**
 * A minutes duration field. The text field accepts any whole number, while the
 * minus/plus buttons snap to the nearest 15-minute mark beyond the current value
 * (e.g. 37 → 45 on plus, 37 → 30 on minus).
 */
export default function DurationStepper({
    value,
    onChange,
    min = 15,
    max = 600,
    id,
    invalid,
}: Props) {
    const clamp = (next: number) => Math.min(Math.max(next, min), max);

    // Next/previous 15-minute mark strictly beyond the current value.
    const increment = () => onChange(clamp(Math.floor(value / STEP) * STEP + STEP));
    const decrement = () => onChange(clamp(Math.ceil(value / STEP) * STEP - STEP));

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Decrease duration"
                data-test="duration-decrement"
                disabled={value <= min}
                onClick={decrement}
            >
                <Minus className="size-4" />
            </Button>

            <div className="relative flex-1">
                <NumericInput
                    id={id}
                    value={value ? value : ''}
                    aria-invalid={invalid}
                    onChange={(event) =>
                        onChange(
                            event.target.value === ''
                                ? 0
                                : Number(event.target.value),
                        )
                    }
                    onBlur={(event) =>
                        onChange(clamp(Number(event.target.value) || min))
                    }
                    className="pr-14 text-center"
                    data-test="duration-input"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    {formatDuration(clamp(value || min))}
                </span>
            </div>

            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Increase duration"
                data-test="duration-increment"
                disabled={value >= max}
                onClick={increment}
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
}

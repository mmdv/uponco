import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDuration } from '@/lib/appointments';
import { cn } from '@/lib/utils';

type Props = {
    /** Current duration in minutes. */
    value: number;
    onChange: (value: number) => void;
    /** Smallest allowed duration; also the increment for the +/- buttons. */
    min?: number;
    max?: number;
    step?: number;
    id?: string;
    invalid?: boolean;
};

/**
 * A minutes duration field with minus/plus buttons that step by 15 minutes.
 *
 * The buttons clamp to `[min, max]`; the input still accepts any typed integer
 * (clamped to `min` on blur) so a user can enter an arbitrary length.
 */
export default function DurationStepper({
    value,
    onChange,
    min = 15,
    max = 600,
    step = 15,
    id,
    invalid,
}: Props) {
    const clamp = (next: number) => Math.min(Math.max(next, min), max);

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Decrease duration"
                data-test="duration-decrement"
                disabled={value <= min}
                onClick={() => onChange(clamp(value - step))}
            >
                <Minus className="size-4" />
            </Button>

            <div className="relative flex-1">
                <Input
                    id={id}
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={max}
                    step={step}
                    value={Number.isNaN(value) ? '' : value}
                    aria-invalid={invalid}
                    onChange={(event) => onChange(Number(event.target.value))}
                    onBlur={(event) => onChange(clamp(Number(event.target.value) || min))}
                    className={cn('pr-14 text-center')}
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
                onClick={() => onChange(clamp(value + step))}
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
}

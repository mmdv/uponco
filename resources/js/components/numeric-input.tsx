import { useState } from 'react';

import { Input } from '@/components/ui/input';

type Props = Omit<
    React.ComponentProps<typeof Input>,
    'type' | 'inputMode' | 'step' | 'min' | 'max'
> & {
    /** Allows a single decimal separator; whole numbers only when off. */
    decimal?: boolean;
};

/**
 * A digits-only text field.
 *
 * `type="number"` spins its value when the wheel turns over a focused field, so
 * scrolling a form silently rewrites whatever price or duration the cursor
 * happens to sit on. This keeps the numeric keypad on phones through
 * `inputMode` but drops that behaviour by staying a text field, and refuses any
 * keystroke or paste that is not a number.
 */
export default function NumericInput({
    decimal = false,
    value,
    defaultValue,
    onChange,
    ...props
}: Props) {
    const [uncontrolled, setUncontrolled] = useState(
        () => defaultValue?.toString() ?? '',
    );

    const isControlled = value !== undefined;
    const current = isControlled ? value.toString() : uncontrolled;

    /** The accepted form of `raw`, or null when it is not a number at all. */
    const normalize = (raw: string): string | null => {
        // A comma is what the decimal key gives on a lot of layouts.
        const candidate = decimal ? raw.replace(',', '.') : raw;
        const allowed = decimal ? /^\d*\.?\d*$/ : /^\d*$/;

        return allowed.test(candidate) ? candidate : null;
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={current}
            onChange={(event) => {
                const next = normalize(event.target.value);

                if (next === null) {
                    // Nothing changed, so React has no re-render to reset the
                    // field with — the rejected character has to be undone here.
                    event.target.value = current;

                    return;
                }

                event.target.value = next;

                if (!isControlled) {
                    setUncontrolled(next);
                }

                onChange?.(event);
            }}
        />
    );
}

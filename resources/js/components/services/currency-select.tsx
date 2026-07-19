import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { CurrencyCode, SelectOption } from '@/types';

type Props = {
    id?: string;
    /** Submitted alongside the price inputs; omit for uncontrolled wizard state. */
    name?: string;
    value: CurrencyCode;
    onChange: (value: CurrencyCode) => void;
    options: SelectOption[];
    disabled?: boolean;
    label: string;
    className?: string;
    'data-test'?: string;
};

/**
 * Compact currency picker that sits inline beside a price input.
 *
 * Deliberately a native `<select>` rather than the Radix one: it has only three
 * fixed options, needs no search, and renders without a portal — so it behaves
 * the same inside the dialogs and the wizard, and gets the OS picker on mobile.
 */
export function CurrencySelect({
    id,
    name,
    value,
    onChange,
    options,
    disabled,
    label,
    className,
    ...props
}: Props) {
    return (
        <div className={cn('relative shrink-0', className)}>
            <select
                id={id}
                name={name}
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.target.value as CurrencyCode)
                }
                data-test={props['data-test']}
                className={cn(
                    'h-11 w-full appearance-none rounded-xl border border-input bg-transparent py-2 pr-8 pl-3 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                )}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50" />
        </div>
    );
}

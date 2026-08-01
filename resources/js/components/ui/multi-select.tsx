import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
    value: string;
    label: string;
};

type MultiSelectProps = {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    'data-test'?: string;
};

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select options',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    id,
    disabled,
    invalid,
    className,
    ...props
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);

    // When used inside a Sheet/Dialog, portaling the popover to document.body
    // puts the search input outside the dialog's focus trap (steals focus so
    // typing is impossible) and stacks a second modal layer that can leave
    // `body{pointer-events:none}` behind when the drawer closes. Render the
    // content inside the nearest dialog instead. See searchable-select.tsx.
    const getContainer = () =>
        triggerRef.current?.closest<HTMLElement>(
            '[data-slot="sheet-content"], [data-slot="dialog-content"], [data-slot="popover-content"]',
        ) ?? undefined;

    const selected = options.filter((option) => value.includes(option.value));

    const filtered = query.trim()
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options;

    const toggle = (nextValue: string) => {
        if (value.includes(nextValue)) {
            onChange(value.filter((current) => current !== nextValue));
        } else {
            onChange([...value, nextValue]);
        }
    };

    const remove = (nextValue: string) => {
        onChange(value.filter((current) => current !== nextValue));
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    setQuery('');
                }
            }}
        >
            <PopoverTrigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    id={id}
                    disabled={disabled}
                    aria-invalid={invalid}
                    className={cn(
                        'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-4 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30',
                        className,
                    )}
                    {...props}
                >
                    {selected.length > 0 ? (
                        <span className="flex flex-1 flex-wrap gap-1">
                            {selected.map((option) => (
                                <span
                                    key={option.value}
                                    className="inline-flex items-center gap-1 rounded-sm bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                                >
                                    {option.label}
                                    <X
                                        className="size-3 shrink-0 opacity-60 hover:opacity-100"
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            remove(option.value);
                                        }}
                                    />
                                </span>
                            ))}
                        </span>
                    ) : (
                        <span className="truncate text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                container={getContainer()}
                className="w-[var(--radix-popover-trigger-width)] p-0"
            >
                <div className="flex items-center border-b px-2">
                    <Search className="size-4 shrink-0 opacity-50" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                    />
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                    {filtered.length === 0 ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    ) : (
                        filtered.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => toggle(option.value)}
                                className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="truncate">{option.label}</span>
                                {value.includes(option.value) ? (
                                    <Check className="size-4 shrink-0" />
                                ) : null}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

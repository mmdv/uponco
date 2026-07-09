import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type SelectOption = {
    value: string;
    label: string;
};

type SearchableSelectProps = {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    'data-test'?: string;
};

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    id,
    disabled,
    invalid,
    className,
    ...props
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [maxHeight, setMaxHeight] = useState<number>();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // On iOS the on-screen keyboard shrinks the visual viewport without
    // resizing the layout viewport, so Radix's collision handling can't see it
    // and the results list ends up hidden behind the keyboard. Measure the
    // visual viewport ourselves and cap the popover height so the list always
    // stays above the keyboard (scrolling within that bound).
    useEffect(() => {
        if (!open) {
            setMaxHeight(undefined);

            return;
        }

        const viewport = window.visualViewport;

        const updateMaxHeight = () => {
            const content = contentRef.current;

            if (!content) {
                return;
            }

            const contentTop = content.getBoundingClientRect().top;
            const viewportBottom = viewport
                ? viewport.height + viewport.offsetTop
                : window.innerHeight;

            setMaxHeight(
                Math.min(Math.max(viewportBottom - contentTop - 8, 168), 384),
            );
        };

        const raf = requestAnimationFrame(updateMaxHeight);

        viewport?.addEventListener('resize', updateMaxHeight);
        viewport?.addEventListener('scroll', updateMaxHeight);

        return () => {
            cancelAnimationFrame(raf);
            viewport?.removeEventListener('resize', updateMaxHeight);
            viewport?.removeEventListener('scroll', updateMaxHeight);
        };
    }, [open]);

    // When this select is used inside a Sheet/Dialog, portaling the popover to
    // document.body puts the search input outside the dialog's focus trap, which
    // steals focus back and makes typing impossible. Render the content inside
    // the nearest dialog so it stays within the same focus scope.
    const getContainer = () =>
        triggerRef.current?.closest<HTMLElement>(
            '[data-slot="sheet-content"], [data-slot="dialog-content"]',
        ) ?? undefined;

    const selected = options.find((option) => option.value === value);

    const filtered = query.trim()
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options;

    const select = (nextValue: string) => {
        onChange(nextValue);
        setOpen(false);
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
                        'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-4 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30',
                        className,
                    )}
                    {...props}
                >
                    <span
                        className={cn(
                            'truncate',
                            !selected && 'text-muted-foreground',
                        )}
                    >
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                ref={contentRef}
                align="start"
                container={getContainer()}
                style={maxHeight ? { maxHeight } : undefined}
                className="flex w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden p-0"
            >
                <div className="flex shrink-0 items-center border-b px-2">
                    <Search className="size-4 shrink-0 opacity-50" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                    />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-1">
                    {filtered.length === 0 ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    ) : (
                        filtered.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => select(option.value)}
                                className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                            >
                                <span className="truncate">{option.label}</span>
                                {option.value === value ? (
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

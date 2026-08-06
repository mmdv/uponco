import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowLeft, Check, ChevronDown, Search, XIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export type SelectOption = {
    value: string;
    label: string;
    /** Section the option is listed under; options without one render flat. */
    group?: string;
    /** Shown before the label, in the list and on the trigger once chosen. */
    icon?: LucideIcon;
};

type SelectDialogProps = {
    title: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    confirmLabel?: string;
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    /**
     * The option that, once picked, asks for a free-text answer instead of
     * standing on its own — an "Other" catch-all, in practice.
     */
    customTriggerValue?: string;
    customValue?: string;
    onCustomChange?: (value: string) => void;
    customLabel?: string;
    customPlaceholder?: string;
    'data-test'?: string;
};

/**
 * Tracks the visible viewport so the mobile full-screen picker can size itself
 * to the area above the on-screen keyboard. Mobile browsers don't shrink the
 * layout viewport when the keyboard opens, so without this the confirm button
 * and part of the list end up hidden behind it.
 */
function useVisibleViewport(active: boolean) {
    const [viewport, setViewport] = useState<{ top: number; height: number }>();

    useEffect(() => {
        if (!active) {
            setViewport(undefined);

            return;
        }

        const visualViewport = window.visualViewport;

        const update = () => {
            setViewport({
                top: visualViewport?.offsetTop ?? 0,
                height: visualViewport?.height ?? window.innerHeight,
            });
        };

        update();
        visualViewport?.addEventListener('resize', update);
        visualViewport?.addEventListener('scroll', update);

        return () => {
            visualViewport?.removeEventListener('resize', update);
            visualViewport?.removeEventListener('scroll', update);
        };
    }, [active]);

    return viewport;
}

export function SelectDialog({
    title,
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    confirmLabel = 'Confirm',
    id,
    disabled,
    invalid,
    className,
    customTriggerValue,
    customValue = '',
    onCustomChange,
    customLabel = 'Tell us what you do',
    customPlaceholder = 'Type your answer',
    ...props
}: SelectDialogProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [draft, setDraft] = useState(value);
    const [customDraft, setCustomDraft] = useState(customValue);
    const viewport = useVisibleViewport(open && isMobile);

    const selected = options.find((option) => option.value === value);
    const needsCustom =
        customTriggerValue !== undefined && draft === customTriggerValue;

    const filtered = query.trim()
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options;

    const openDialog = (next: boolean) => {
        setOpen(next);

        if (next) {
            setDraft(value);
            setCustomDraft(customValue);
            setQuery('');
        }
    };

    const confirm = () => {
        onChange(draft);
        onCustomChange?.(needsCustom ? customDraft.trim() : '');
        setOpen(false);
    };

    /**
     * The trigger reads back what was actually chosen, so an "Other" answer
     * shows the words the user typed rather than the word "Other".
     */
    const triggerLabel =
        selected && value === customTriggerValue && customValue.trim()
            ? customValue
            : selected?.label;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={openDialog}>
            <DialogPrimitive.Trigger asChild>
                <button
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
                    <span className="flex min-w-0 items-center gap-2">
                        {selected?.icon ? (
                            <selected.icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                        <span
                            className={cn(
                                'truncate',
                                !selected && 'text-muted-foreground',
                            )}
                        >
                            {triggerLabel ?? placeholder}
                        </span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                        isMobile && 'bg-background',
                    )}
                />
                <DialogPrimitive.Content
                    data-slot="dialog-content"
                    aria-describedby={undefined}
                    style={
                        isMobile
                            ? {
                                  top: viewport?.top ?? 0,
                                  height: viewport?.height ?? '100dvh',
                              }
                            : undefined
                    }
                    className={cn(
                        'fixed z-50 flex flex-col bg-background outline-none',
                        isMobile
                            ? 'inset-x-0 w-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom'
                            : 'top-[50%] left-[50%] max-h-[80vh] w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden rounded-lg border shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                    )}
                >
                    <div
                        className={cn(
                            'flex shrink-0 items-center gap-2 border-b',
                            isMobile ? 'h-14 px-2' : 'px-6 pt-6 pb-4',
                        )}
                    >
                        {isMobile ? (
                            <DialogPrimitive.Close asChild>
                                <button
                                    type="button"
                                    aria-label="Back"
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    <ArrowLeft className="size-5" />
                                </button>
                            </DialogPrimitive.Close>
                        ) : null}
                        <DialogPrimitive.Title
                            className={cn(
                                'text-base leading-none font-semibold',
                                isMobile && 'text-lg',
                            )}
                        >
                            {title}
                        </DialogPrimitive.Title>
                        {!isMobile ? (
                            <DialogPrimitive.Close asChild>
                                <button
                                    type="button"
                                    aria-label="Close"
                                    className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:opacity-100"
                                >
                                    <XIcon className="size-4" />
                                </button>
                            </DialogPrimitive.Close>
                        ) : null}
                    </div>

                    <div className="flex shrink-0 items-center border-b px-4">
                        <Search className="size-4 shrink-0 opacity-50" />
                        <Input
                            autoFocus={!isMobile}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-12 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                        />
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </p>
                        ) : (
                            filtered.map((option, index) => (
                                <div key={option.value}>
                                    {option.group &&
                                    option.group !==
                                        filtered[index - 1]?.group ? (
                                        <p className="sticky top-0 z-10 bg-background px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {option.group}
                                        </p>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setDraft(option.value)}
                                        className={cn(
                                            'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                            option.value === draft &&
                                                'bg-accent text-accent-foreground',
                                        )}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            {option.icon ? (
                                                <option.icon className="size-4 shrink-0 text-muted-foreground" />
                                            ) : null}
                                            <span className="truncate">
                                                {option.label}
                                            </span>
                                        </span>
                                        {option.value === draft ? (
                                            <Check className="size-4 shrink-0 text-primary" />
                                        ) : null}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="shrink-0 space-y-3 border-t p-4">
                        {needsCustom ? (
                            <div className="grid gap-2">
                                <Label htmlFor={`${id ?? 'select'}-custom`}>
                                    {customLabel}
                                </Label>
                                <Input
                                    id={`${id ?? 'select'}-custom`}
                                    autoFocus
                                    maxLength={100}
                                    value={customDraft}
                                    onChange={(event) =>
                                        setCustomDraft(event.target.value)
                                    }
                                    placeholder={customPlaceholder}
                                />
                            </div>
                        ) : null}
                        <Button
                            type="button"
                            className="w-full"
                            disabled={
                                !draft || (needsCustom && !customDraft.trim())
                            }
                            onClick={confirm}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

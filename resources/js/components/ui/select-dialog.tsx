import { Check, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SelectOption = {
    value: string;
    label: string;
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
    'data-test'?: string;
};

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
    ...props
}: SelectDialogProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [draft, setDraft] = useState(value);

    const selected = options.find((option) => option.value === value);

    const filtered = query.trim()
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options;

    const openDialog = (next: boolean) => {
        setOpen(next);

        if (next) {
            setDraft(value);
            setQuery('');
        }
    };

    const confirm = () => {
        onChange(draft);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={openDialog}>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col gap-4 p-0 sm:max-w-md">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center border-b px-4">
                    <Search className="size-4 shrink-0 opacity-50" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-11 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3">
                    {filtered.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </p>
                    ) : (
                        filtered.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => setDraft(option.value)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                    option.value === draft &&
                                        'bg-accent text-accent-foreground',
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {option.value === draft ? (
                                    <Check className="size-4 shrink-0" />
                                ) : null}
                            </button>
                        ))
                    )}
                </div>

                <div className="border-t px-6 pb-6 pt-4">
                    <Button
                        type="button"
                        className="w-full"
                        disabled={!draft}
                        onClick={confirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

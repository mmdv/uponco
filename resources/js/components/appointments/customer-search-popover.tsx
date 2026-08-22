import { Loader2, ScanSearch, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from '@/hooks/use-translation';
import { search as customersSearch } from '@/routes/customers';

const SEARCH_DEBOUNCE_MS = 300;

export type CustomerSearchResult = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type Props = {
    onSelect: (customer: CustomerSearchResult) => void;
    id?: string;
};

/**
 * Search-and-select existing team customers to autofill the appointment form's
 * customer fields. Queries the JSON search endpoint on a debounced term and
 * fills whatever details the picked customer has. Selecting again overwrites the
 * previous fill, so a wrong first pick can be corrected.
 */
export default function CustomerSearchPopover({ onSelect, id }: Props) {
    const { t } = useTranslation('appointments');
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CustomerSearchResult[]>([]);

    const triggerRef = useRef<HTMLButtonElement>(null);
    // Bumps on every request so out-of-order responses can be discarded.
    const requestId = useRef(0);

    // When this popover is used inside a Sheet/Dialog, portaling its content to
    // document.body puts the search input outside the dialog's focus trap, which
    // steals focus back and makes typing impossible. Render inside the nearest
    // dialog so the input stays within the same focus scope.
    const getContainer = () =>
        triggerRef.current?.closest<HTMLElement>(
            '[data-slot="sheet-content"], [data-slot="dialog-content"]',
        ) ?? undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        const term = query.trim();

        if (term === '') {
            requestId.current += 1;
            setResults([]);
            setLoading(false);

            return;
        }

        const currentRequest = ++requestId.current;
        setLoading(true);

        const timeout = window.setTimeout(() => {
            fetch(customersSearch.url({ query: { search: term } }), {
                headers: { Accept: 'application/json' },
            })
                .then((response) => response.json())
                .then((data: { customers: CustomerSearchResult[] }) => {
                    if (currentRequest !== requestId.current) {
                        return;
                    }

                    setResults(data.customers ?? []);
                    setLoading(false);
                })
                .catch(() => {
                    if (currentRequest !== requestId.current) {
                        return;
                    }

                    setResults([]);
                    setLoading(false);
                });
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeout);
    }, [query, open]);

    const select = (customer: CustomerSearchResult) => {
        onSelect(customer);
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (!next) {
                    setQuery('');
                    setResults([]);
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    ref={triggerRef}
                    id={id}
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t('customer.searchLabel')}
                    className="shrink-0"
                    data-test="appointment-customer-search-button"
                >
                    <ScanSearch className="size-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                container={getContainer()}
                className="flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0"
            >
                <div className="flex shrink-0 items-center border-b px-2">
                    <Search className="size-4 shrink-0 opacity-50" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('customer.searchPlaceholder')}
                        className="h-9 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                        data-test="appointment-customer-search-input"
                    />
                </div>
                <div className="max-h-72 min-h-0 flex-1 overflow-y-auto p-1">
                    {loading ? (
                        <p className="flex items-center justify-center gap-2 px-2 py-3 text-center text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            {t('customer.searchLoading')}
                        </p>
                    ) : query.trim() === '' ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {t('customer.searchHint')}
                        </p>
                    ) : results.length === 0 ? (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {t('customer.searchEmpty')}
                        </p>
                    ) : (
                        results.map((customer) => (
                            <button
                                key={customer.id}
                                type="button"
                                onClick={() => select(customer)}
                                className="flex w-full flex-col gap-0.5 rounded-sm px-2 py-1.5 text-left outline-none hover:bg-accent hover:text-accent-foreground"
                                data-test="appointment-customer-search-result"
                            >
                                <span className="truncate text-sm font-medium">
                                    {customer.name}
                                </span>
                                {customer.email || customer.phone ? (
                                    <span className="truncate text-xs text-muted-foreground">
                                        {[customer.email, customer.phone]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                ) : null}
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

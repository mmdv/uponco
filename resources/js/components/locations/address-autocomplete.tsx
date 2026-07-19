import { Check, Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { resolve, suggest } from '@/routes/company/locations/address';

export type ResolvedPlace = {
    place_id: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
    street_address: string;
    city: string;
    postal_code: string;
    country: string;
};

type Suggestion = {
    place_id: string;
    main_text: string;
    secondary_text: string;
};

type Props = {
    teamSlug: string;
    country: string;
    /** The address already saved on the location, if any. */
    initialAddress: string | null;
    /** Whether the saved address was previously verified against Google. */
    initialVerified: boolean;
    onResolved: (place: ResolvedPlace) => void;
    /** Fired when the operator edits the query, invalidating any prior match. */
    onCleared: () => void;
};

/**
 * Address search backed by Google Places.
 *
 * Picking a suggestion is what gives an appointment reliable directions: it
 * stores coordinates and a place id alongside the text, so maps resolve the
 * exact spot rather than re-guessing a typed address.
 */
export default function AddressAutocomplete({
    teamSlug,
    country,
    initialAddress,
    initialVerified,
    onResolved,
    onCleared,
}: Props) {
    const { t } = useTranslation('locations');

    const [query, setQuery] = useState(initialAddress ?? '');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(initialVerified);

    const containerRef = useRef<HTMLDivElement>(null);
    // Guards against a slow earlier request overwriting a newer one's results.
    const requestRef = useRef(0);

    // Derived rather than stored, so the effect never has to clear state
    // synchronously — that triggers a cascading re-render on every keystroke.
    const shouldSearch = !isVerified && query.trim().length >= 3;

    useEffect(() => {
        if (!shouldSearch) {
            return;
        }

        const requestId = ++requestRef.current;

        const timer = window.setTimeout(() => {
            setIsSearching(true);

            fetch(
                suggest.url(teamSlug, {
                    query: { query, ...(country ? { country } : {}) },
                }),
                { headers: { Accept: 'application/json' } },
            )
                .then((response) =>
                    response.ok ? response.json() : { suggestions: [] },
                )
                .then((data: { suggestions: Suggestion[] }) => {
                    if (requestId !== requestRef.current) {
                        return;
                    }

                    setSuggestions(data.suggestions ?? []);
                    setIsOpen(true);
                })
                .catch(() => {
                    if (requestId === requestRef.current) {
                        setSuggestions([]);
                    }
                })
                .finally(() => {
                    if (requestId === requestRef.current) {
                        setIsSearching(false);
                    }
                });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [query, country, teamSlug, shouldSearch]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleChange(value: string) {
        setQuery(value);
        setIsOpen(true);

        if (isVerified) {
            setIsVerified(false);
            onCleared();
        }
    }

    function handleSelect(suggestion: Suggestion) {
        setIsOpen(false);
        setIsSearching(true);

        fetch(
            resolve.url(teamSlug, {
                query: { place_id: suggestion.place_id },
            }),
            { headers: { Accept: 'application/json' } },
        )
            .then((response) => (response.ok ? response.json() : null))
            .then((data: { place: ResolvedPlace } | null) => {
                if (!data?.place) {
                    return;
                }

                setQuery(data.place.formatted_address);
                setIsVerified(true);
                setSuggestions([]);
                onResolved(data.place);
            })
            .finally(() => setIsSearching(false));
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id="address_search"
                    type="text"
                    autoComplete="off"
                    value={query}
                    onChange={(event) => handleChange(event.target.value)}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    placeholder={t('form.addressSearchPlaceholder')}
                    className="pr-9 pl-9"
                    data-test="location-address-search"
                />
                {isSearching ? (
                    <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : isVerified ? (
                    <Check className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-emerald-600" />
                ) : null}
            </div>

            {isOpen && shouldSearch && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.place_id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                            >
                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">
                                        {suggestion.main_text}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {suggestion.secondary_text}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-xs text-muted-foreground">
                {isVerified
                    ? t('form.addressVerified')
                    : t('form.addressSearchHint')}
            </p>
        </div>
    );
}

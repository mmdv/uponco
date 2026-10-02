import { Search, X } from 'lucide-react';
import { useRef } from 'react';

import { useTranslation } from '@/hooks/use-translation';

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    /** Desktop only: on a phone it would throw the keyboard over the list. */
    autoFocus?: boolean;
    'data-test'?: string;
};

/**
 * The picker's search box: a large, pill-shaped input with a one-tap clear
 * button that hands focus straight back, so a visitor can try another word.
 */
export default function SearchField({
    value,
    onChange,
    placeholder,
    autoFocus = false,
    'data-test': dataTest,
}: Props) {
    const { t } = useTranslation('booking');
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Escape' && value !== '') {
                        // Clear first; a second Escape closes the sheet.
                        event.stopPropagation();
                        onChange('');
                    }
                }}
                placeholder={placeholder}
                autoFocus={autoFocus}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                aria-label={placeholder}
                data-test={dataTest}
                className="h-11 w-full rounded-full border border-input bg-muted/40 pr-10 pl-10 text-[16px] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/15 md:text-sm [&::-webkit-search-cancel-button]:hidden"
            />

            {value !== '' && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        inputRef.current?.focus();
                    }}
                    aria-label={t('v2.picker.clearSearch')}
                    className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 animate-in items-center justify-center rounded-full bg-muted text-muted-foreground duration-150 fade-in-0 zoom-in-50 hover:bg-foreground/10 hover:text-foreground"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/use-translation';

export function LanguageSwitcher() {
    const { locale, availableLocales, setLocale } = useLocale();

    // Nothing to switch between until at least two locales are enabled.
    if (availableLocales.length < 2) {
        return null;
    }

    const current =
        availableLocales.find((language) => language.code === locale) ??
        availableLocales[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="group h-9 cursor-pointer gap-1.5"
                >
                    <span className="uppercase">{current.code}</span>
                    <ChevronDown className="size-4 opacity-60 transition-transform group-hover:opacity-100 group-data-[state=open]:rotate-180" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
                    {availableLocales.map((language) => (
                        <DropdownMenuRadioItem
                            key={language.code}
                            value={language.code}
                        >
                            {language.native}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

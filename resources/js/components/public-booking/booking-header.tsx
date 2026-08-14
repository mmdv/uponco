import { Link } from '@inertiajs/react';
import {
    Check,
    Copy,
    EllipsisVertical,
    Languages,
    Moon,
    Share2,
    Sun,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useLocale } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export type PublicTheme = 'light' | 'dark';

type Props = {
    companyName: string;
    /**
     * What leads the page. For a solo practitioner this is their own name
     * rather than the business name, which is usually the same thing said
     * twice. Defaults to the company name, which is what the cancellation
     * page wants.
     */
    headline?: string;
    /** Their job title or slogan; falls back to "Book an appointment". */
    tagline?: string | null;
    logoUrl?: string | null;
    /**
     * On a deep-linked page, where the logo and name lead: back to the full
     * booking page. Absent on the full page, where they lead nowhere.
     */
    backUrl?: string | null;
    theme: PublicTheme;
    onThemeChange: (theme: PublicTheme) => void;
    /**
     * Hides the share/appearance menu. Used by the dashboard preview, where
     * sharing lives on the surrounding card and the theme and locale belong to
     * the signed-in user rather than to a visitor.
     */
    showMenu?: boolean;
};

/**
 * Derive up to two uppercase initials from the company name, used as the logo
 * fallback when no logo image is supplied.
 */
function initialsFrom(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

/** The current page URL is exactly the shareable booking link. */
function currentUrl(): string {
    return typeof window === 'undefined' ? '' : window.location.href;
}

function supportsNativeShare(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
    );
}

/**
 * Public booking header: a left-aligned logo + company name, and a menu button
 * that opens a popover for sharing the booking link and switching the theme.
 */
export default function BookingHeader({
    companyName,
    headline = companyName,
    tagline,
    logoUrl,
    backUrl,
    theme,
    onThemeChange,
    showMenu = true,
}: Props) {
    const { locale, availableLocales, setLocale } = useLocale();
    const [shareUrl] = useState(currentUrl);
    const [canNativeShare] = useState(supportsNativeShare);
    const [copied, setCopied] = useState(false);

    const handleNativeShare = () => {
        navigator
            .share({
                title: `Book with ${companyName}`,
                url: shareUrl,
            })
            .catch(() => {
                // The visitor dismissed the share sheet; nothing to do.
            });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be blocked; leave the link visible to copy.
        }
    };

    // The logo and name double as the way back to the full booking page on a
    // deep-linked one — a dedicated back link said the same thing and cost a
    // whole row of an already crowded header.
    const identity = (
        <>
            <Avatar className="size-12 rounded-xl">
                {logoUrl ? (
                    <AvatarImage
                        src={logoUrl}
                        alt={companyName}
                        className="rounded-xl object-cover"
                    />
                ) : null}
                <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {initialsFrom(headline)}
                </AvatarFallback>
            </Avatar>

            <div className="text-left">
                <h1 className="text-lg leading-tight font-semibold">
                    {headline}
                </h1>
                <p className="text-xs text-muted-foreground">
                    {tagline || 'Book an appointment'}
                </p>
            </div>
        </>
    );

    return (
        <div className="flex items-center justify-between gap-3">
            {backUrl ? (
                <Link
                    href={backUrl}
                    className="flex min-w-0 items-center gap-3 rounded-xl transition-opacity hover:opacity-75"
                    aria-label={`All bookings at ${companyName}`}
                    data-test="booking-back-to-company"
                >
                    {identity}
                </Link>
            ) : (
                <div className="flex min-w-0 items-center gap-3">
                    {identity}
                </div>
            )}

            {showMenu && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Share and appearance"
                            data-test="booking-header-menu"
                        >
                            <EllipsisVertical className="size-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-72 space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                Theme
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        theme === 'light'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => onThemeChange('light')}
                                    data-test="booking-theme-light"
                                >
                                    <Sun className="size-4" />
                                    Light
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        theme === 'dark' ? 'default' : 'outline'
                                    }
                                    onClick={() => onThemeChange('dark')}
                                    data-test="booking-theme-dark"
                                >
                                    <Moon className="size-4" />
                                    Dark
                                </Button>
                            </div>
                        </div>

                        {availableLocales.length > 1 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Language
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableLocales.map((language) => (
                                        <Button
                                            key={language.code}
                                            type="button"
                                            variant={
                                                locale === language.code
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                setLocale(language.code)
                                            }
                                            data-test={`booking-language-${language.code}`}
                                        >
                                            <Languages className="size-4" />
                                            {language.native}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                Share
                            </p>
                            {canNativeShare ? (
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={handleNativeShare}
                                    data-test="booking-share-native"
                                >
                                    <Share2 className="size-4" />
                                    Share booking page
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={shareUrl}
                                        onFocus={(event) =>
                                            event.currentTarget.select()
                                        }
                                        className="h-9 text-xs"
                                        data-test="booking-share-link"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className={cn(
                                            'shrink-0',
                                            copied && 'text-primary',
                                        )}
                                        onClick={handleCopy}
                                        aria-label="Copy booking link"
                                        data-test="booking-share-copy"
                                    >
                                        {copied ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

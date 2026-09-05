import {
    ChevronDown,
    ExternalLink,
    Info,
    MapPin,
    Moon,
    Navigation,
    Settings,
    Sun,
    User,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { accentFrom, brandStyle } from '@/lib/brand';
import { GENERIC_SERVICE_ICON } from '@/lib/business-category-icons';
import { cn } from '@/lib/utils';
import type { Team } from '@/types';

type Props = {
    team: Team;
    /** The colour being edited, as `#rrggbb`. The preview follows it live. */
    primary: string;
    /** Where "open the real thing" goes. */
    bookingUrl: string;
};

/** A grey placeholder standing in for a line of the visitor's content. */
function Bar({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'block h-2 rounded-full bg-muted-foreground/20',
                className,
            )}
        />
    );
}

/** Up to two uppercase initials, mirroring the public header's logo fallback. */
function initialsFrom(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();
}

/**
 * A wireframe of the public booking page's first step, painted in the team's
 * brand colours. It is deliberately a skeleton — real headings and brand-tinted
 * chrome, grey bars for whatever the visitor's own content would fill in — so
 * the colour is what stands out rather than the layout.
 *
 * The light/dark switch is scoped to the frame via `.theme-light` /
 * `.theme-dark`, so the preview answers for the booking page regardless of the
 * theme the dashboard around it is in.
 */
export default function BrandPreview({ team, primary, bookingUrl }: Props) {
    const { t } = useTranslation('company');
    const [dark, setDark] = useState(false);

    const palette = { primary, accent: accentFrom(primary) };

    return (
        <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">
                        {t('brand.preview.title')}
                    </h3>
                    <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
                        {t('brand.preview.description')}
                    </p>
                </div>

                <div className="flex flex-none rounded-lg border p-0.5">
                    {(['light', 'dark'] as const).map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            aria-pressed={dark === (mode === 'dark')}
                            data-test={`brand-preview-${mode}`}
                            onClick={() => setDark(mode === 'dark')}
                            className={cn(
                                'flex size-7 items-center justify-center rounded-md transition-colors',
                                dark === (mode === 'dark')
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                            title={t(`brand.preview.${mode}`)}
                        >
                            {mode === 'light' ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div
                data-test="brand-preview-frame"
                className={cn(
                    'mt-3 overflow-hidden rounded-2xl border bg-background sm:mt-4',
                    // Pinned either way: the dashboard around it has a theme of
                    // its own, and the preview answers for the booking page.
                    dark ? 'theme-dark' : 'theme-light',
                )}
                style={brandStyle(palette)}
            >
                <div className="flex flex-col gap-4 p-4 sm:min-h-[30rem] sm:gap-5">
                    {/* Mirrors BookingHeader: logo tile, name, tagline, menu */}
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                            {team.logoUrl ? (
                                <img
                                    src={team.logoUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                initialsFrom(team.name)
                            )}
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm leading-tight font-semibold text-foreground">
                                {team.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('brand.preview.tagline')}
                            </p>
                        </div>

                        <Settings className="size-4 shrink-0 text-muted-foreground" />
                    </div>

                    <p className="text-base font-semibold tracking-tight text-foreground">
                        {t('brand.preview.heading')}
                    </p>

                    {/* Mirrors LockedRow: a settled choice, washed with the accent */}
                    <div className="rounded-2xl border border-primary bg-brand-accent p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <MapPin className="size-5" />
                            </span>

                            <div className="min-w-0 flex-1 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    {t('brand.preview.location')}
                                </p>
                                <Bar className="h-2.5 w-2/3" />
                                <Bar className="w-full" />
                                <Bar className="w-1/2" />
                            </div>

                            <Info className="size-4 shrink-0 text-muted-foreground" />
                        </div>

                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                            <Navigation className="size-3.5" />
                            {t('brand.preview.directions')}
                        </p>
                    </div>

                    {/*
                     * Mirrors ExpandableCard: the choices still to make. Hidden
                     * on a phone — they carry no brand colour, and dropping them
                     * is what keeps the coloured card and the CTA above the fold
                     * while the swatches right above are being tapped.
                     */}
                    {(
                        [
                            ['service', GENERIC_SERVICE_ICON],
                            ['specialist', User],
                        ] as const
                    ).map(([kind, Icon]) => (
                        <div
                            key={kind}
                            className="hidden items-center gap-3 rounded-2xl border bg-card p-4 sm:flex"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <Icon className="size-5" />
                            </span>

                            <div className="min-w-0 flex-1 space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                    {t(`brand.preview.${kind}`)}
                                </p>
                                <Bar className="w-1/2" />
                            </div>

                            <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                        </div>
                    ))}

                    {/* Mirrors the flow's sticky footer CTA */}
                    <div className="pt-1 sm:mt-auto sm:pt-4">
                        <Button type="button" className="w-full" tabIndex={-1}>
                            {t('brand.preview.continue')}
                        </Button>
                    </div>
                </div>
            </div>

            <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
                <ExternalLink className="size-3.5" />
                {t('brand.preview.open')}
            </a>
        </div>
    );
}

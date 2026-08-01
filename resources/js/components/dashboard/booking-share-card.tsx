import {
    ArrowUpRight,
    CalendarPlus,
    Check,
    Copy,
    Link2,
    Share2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { show as bookingPage } from '@/routes/public/appointments';

type Props = {
    teamSlug: string;
    companyName: string;
    onAddAppointment: () => void;
};

/** Resolve the booking path against the current origin for sharing. */
function absoluteUrl(path: string): string {
    return typeof window === 'undefined'
        ? path
        : new URL(path, window.location.origin).toString();
}

/** The link without its scheme, which reads better inside a narrow pill. */
function displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, '');
}

function supportsNativeShare(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
    );
}

/**
 * The dashboard's headline call to action: book someone in yourself via the
 * button above, or hand out the public link below so customers can. The card
 * sits on a soft wash of the brand gradient so it reads as ours without
 * competing with the solid primary button standing above it.
 */
export default function BookingShareCard({
    teamSlug,
    companyName,
    onAddAppointment,
}: Props) {
    const { t } = useTranslation('dashboard');
    const path = bookingPage.url(teamSlug);
    const [shareUrl] = useState(() => absoluteUrl(path));
    const [canNativeShare] = useState(supportsNativeShare);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be blocked; the link stays visible to copy.
        }
    };

    const handleNativeShare = () => {
        navigator
            .share({
                title: `${t('bookingPage.shareTitle')} ${companyName}`,
                url: shareUrl,
            })
            .catch(() => {
                // The user dismissed the share sheet; nothing to do.
            });
    };

    return (
        <div className="flex flex-col gap-4">
            {/*
                The primary action sits above the card rather than inside it,
                so it reads as the page's call to action and not as one more
                thing to do with the booking link.
            */}
            <Button
                className="w-full"
                onClick={onAddAppointment}
                data-test="dashboard-add-appointment"
            >
                <CalendarPlus /> {t('quickActions.newAppointment')}
            </Button>

            <section
                className="relative isolate overflow-hidden rounded-2xl border border-primary/10 bg-primary-gradient-soft p-5 shadow-soft sm:p-6 dark:border-primary/20"
                data-test="dashboard-booking-share-card"
            >
                {/* Decorative glow, purely to give the wash some depth. */}
                <div className="pointer-events-none absolute -top-16 -right-10 -z-10 size-48 rounded-full bg-primary/10 blur-3xl" />

                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-sm">
                        <Link2 className="size-5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                        <h3 className="text-base font-medium">
                            {t('bookingPage.title')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('bookingPage.subtitle')}
                        </p>
                    </div>
                </div>

                <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 rounded-xl border border-primary/15 bg-background/70 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-background"
                >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {displayUrl(shareUrl)}
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                </a>

                {/*
                    The actions share the row evenly and stretch to the full
                    width, so they stay balanced whether or not the browser
                    offers a native share sheet.
                */}
                <div className="mt-3 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleCopy}
                        data-test="dashboard-booking-page-copy"
                    >
                        {copied ? <Check /> : <Copy />}
                        {copied
                            ? t('bookingPage.copied')
                            : t('bookingPage.copy')}
                    </Button>

                    {canNativeShare && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleNativeShare}
                        >
                            <Share2 /> {t('bookingPage.share')}
                        </Button>
                    )}

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-test="dashboard-booking-page"
                    >
                        <a
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('bookingPage.open')}
                        </a>
                    </Button>
                </div>
            </section>
        </div>
    );
}

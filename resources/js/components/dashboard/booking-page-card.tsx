import { Check, Copy, ExternalLink, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { PublicBookingFlow } from '@/components/public-booking/booking-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { show as bookingPage } from '@/routes/public/appointments';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    teamSlug: string;
    companyName: string;
    logoUrl?: string | null;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
};

/** Resolve the booking path against the current origin for sharing. */
function absoluteUrl(path: string): string {
    return typeof window === 'undefined'
        ? path
        : new URL(path, window.location.origin).toString();
}

function supportsNativeShare(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
    );
}

/** The logical viewport of a current iPhone, in CSS pixels. */
const IPHONE_WIDTH = 390;
const IPHONE_HEIGHT = 844;

/**
 * Track the rendered width of an element so the preview can be laid out at a
 * real iPhone's logical width and then scaled down to whatever space the card
 * has. Rendering at the true width matters: laying the flow out at ~280px
 * would wrap and truncate text that a customer's phone shows in full.
 */
function useScaleToWidth(width: number) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const element = ref.current;

        if (element === null) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            setScale(entry.contentRect.width / width);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [width]);

    return { ref, scale };
}

/**
 * Surfaces the team's public booking link so it can be copied, shared, or
 * opened in a new tab without hunting through settings.
 */
export default function BookingPageCard({
    teamSlug,
    companyName,
    logoUrl,
    timezone,
    services,
    locations,
    specialists,
}: Props) {
    const { t } = useTranslation('dashboard');
    const path = bookingPage.url(teamSlug);
    const [shareUrl] = useState(() => absoluteUrl(path));
    const [canNativeShare] = useState(supportsNativeShare);
    const [copied, setCopied] = useState(false);
    const { ref, scale } = useScaleToWidth(IPHONE_WIDTH);

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
        <Card className="max-w-full" data-test="dashboard-booking-page-card">
            <CardContent className="space-y-4">
                {/*
                    The actions share the row evenly and stretch to the full
                    width, so they stay balanced whether or not the browser
                    offers a native share sheet.
                */}
                <div className="flex items-center gap-2">
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
                        size="sm"
                        className="flex-1"
                        data-test="dashboard-booking-page"
                    >
                        <a
                            href={path}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink /> {t('bookingPage.open')}
                        </a>
                    </Button>
                </div>

                {/*
                    The live booking flow, exactly as customers see it, so the
                    admin can preview it and take a booking without leaving the
                    dashboard. Slot lookups and the submission both work here:
                    the dashboard route exposes the same `availableSlots` prop,
                    and the public store action redirects back.

                    It sits in a phone shell whose screen carries a modern
                    iPhone's aspect ratio, since that is what nearly every
                    customer will actually book on.
                */}
                <div className="mx-auto w-full max-w-[350px] py-2">
                    <div className="relative w-full rounded-[2.75rem] bg-[#222] p-[10px] shadow-xl ring-1 ring-black/10">
                        <div
                            ref={ref}
                            className="relative w-full overflow-hidden rounded-[2.15rem] bg-background"
                            style={{
                                aspectRatio: `${IPHONE_WIDTH} / ${IPHONE_HEIGHT}`,
                            }}
                        >
                            {/* Dynamic island, floating above the page content. */}
                            <div className="pointer-events-none absolute top-2.5 left-1/2 z-20 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-[#222]" />

                            {/*
                                Laid out at the iPhone's own logical size, then
                                scaled to fit. The scrollport stops short of the
                                bottom so the flow's sticky footer clears the
                                home indicator.
                            */}
                            <div
                                className="absolute top-0 left-0 flex origin-top-left flex-col overflow-x-hidden overflow-y-auto overscroll-contain pt-11"
                                style={{
                                    width: IPHONE_WIDTH,
                                    height: IPHONE_HEIGHT - 16 / scale,
                                    transform: `scale(${scale})`,
                                }}
                                data-test="dashboard-booking-preview"
                            >
                                <PublicBookingFlow
                                    embedded
                                    company={{
                                        name: companyName,
                                        slug: teamSlug,
                                        logo: logoUrl,
                                    }}
                                    timezone={timezone}
                                    services={services}
                                    locations={locations}
                                    specialists={specialists}
                                />
                            </div>

                            {/* Home indicator. */}
                            <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 h-[5px] w-[110px] -translate-x-1/2 rounded-full bg-foreground/25" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

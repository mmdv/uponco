import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowRight, BellRing } from 'lucide-react';
import { FloatingCard } from '@/components/marketing/home/floating-card';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';

/**
 * "Live in five minutes": the closing call to action over a soft gradient,
 * with three phones fanned out — the booking page, the confirmation and the
 * team calendar with a fresh "New booking" alert.
 */
export function FinalCtaSection({
    title,
    subtitle,
    cta,
    href,
    onCtaClick,
    alts,
    newBooking,
}: {
    title: string;
    subtitle: string;
    cta: string;
    href: InertiaLinkProps['href'];
    onCtaClick?: () => void;
    alts: { booking: string; confirmed: string; calendar: string };
    newBooking: { eyebrow: string; title: string; meta: string };
}) {
    return (
        <section className="relative isolate overflow-hidden px-4 pt-20 sm:pt-32">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--background)_0%,#e5eefd_55%,#d3e3fd_100%)] dark:bg-[linear-gradient(180deg,var(--background)_0%,#0b1427_55%,#0b1a38_100%)]"
            />

            <Reveal className="mx-auto max-w-3xl text-center">
                <h2 className="text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-foreground">
                    {title}
                </h2>
                <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
                    {subtitle}
                </p>
                <Link
                    href={href}
                    onClick={onCtaClick}
                    className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[opacity,transform] hover:opacity-95 active:scale-[0.98]"
                >
                    {cta}
                    <ArrowRight className="size-4" />
                </Link>
            </Reveal>

            <Reveal
                delay={0.1}
                className="relative mx-auto mt-16 flex h-[22rem] max-w-4xl items-start justify-center sm:h-[30rem]"
            >
                <PhoneFrame
                    size="sm"
                    tilt="left"
                    className="absolute top-12 left-1/2 hidden -translate-x-[135%] sm:block"
                >
                    <PhoneScreen name="booking-choose" alt={alts.booking} />
                </PhoneFrame>
                <PhoneFrame size="md" className="relative z-10">
                    <PhoneScreen
                        name="booking-confirmed"
                        alt={alts.confirmed}
                    />
                </PhoneFrame>
                <PhoneFrame
                    size="sm"
                    tilt="right"
                    className="absolute top-12 left-1/2 hidden translate-x-[35%] sm:block"
                >
                    <PhoneScreen name="team-calendar" alt={alts.calendar} />
                </PhoneFrame>
                <FloatingCard
                    icon={<BellRing />}
                    eyebrow={newBooking.eyebrow}
                    title={newBooking.title}
                    meta={newBooking.meta}
                    className="top-[20%] right-0 sm:right-[6%]"
                />
            </Reveal>
        </section>
    );
}

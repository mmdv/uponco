import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    CalendarPlus,
    Check,
    Clock,
    MailCheck,
} from 'lucide-react';
import { FloatingCard } from '@/components/marketing/home/floating-card';
import { PhoneScreenSequence } from '@/components/marketing/home/phone-screen-sequence';
import type { SequenceScreen } from '@/components/marketing/home/phone-screen-sequence';

type CardCopy = { eyebrow?: string; title: string; meta?: string };

export type HeroCopy = {
    title: string;
    subtitle: string;
    primaryCta: string;
    demoCta: string;
    trust: string[];
    stepsLabel: string;
    cards: {
        nextAvailable: CardCopy;
        calendar: CardCopy;
        newBooking: CardCopy;
        confirmation: CardCopy;
    };
};

/**
 * The home page hero: one big promise, two calls to action, a trust line, and
 * the real booking flow playing inside a phone with glass cards around it.
 * Presentational — the page passes in copy, links and screens.
 */
export function HeroSection({
    copy,
    screens,
    primaryHref,
    demoHref,
    onPrimaryClick,
}: {
    copy: HeroCopy;
    screens: SequenceScreen[];
    primaryHref: InertiaLinkProps['href'];
    demoHref: string;
    onPrimaryClick?: () => void;
}) {
    const { cards } = copy;

    return (
        <section className="relative isolate -mt-[70px] overflow-hidden px-4 pt-32 pb-20 sm:pt-40 sm:pb-28">
            <SkyBackdrop />

            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-[clamp(2.75rem,6.2vw,5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-foreground">
                    {copy.title}
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground sm:text-[1.3rem]">
                    {copy.subtitle}
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href={primaryHref}
                        onClick={onPrimaryClick}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[opacity,transform] hover:opacity-95 active:scale-[0.98] sm:w-auto"
                    >
                        {copy.primaryCta}
                        <ArrowRight className="size-4" />
                    </Link>
                    <a
                        href={demoHref}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full glass px-6 text-base font-medium text-foreground transition-transform active:scale-[0.98] sm:w-auto"
                    >
                        {copy.demoCta}
                        <ArrowRight className="size-4" />
                    </a>
                </div>

                <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {copy.trust.map((item) => (
                        <li
                            key={item}
                            className="inline-flex items-center gap-1.5"
                        >
                            <Check className="size-4 text-primary" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="relative mx-auto mt-14 w-fit sm:mt-20">
                <PhoneScreenSequence
                    screens={screens}
                    priority
                    size="lg"
                    stepsLabel={copy.stepsLabel}
                />

                <FloatingCard
                    icon={<Clock />}
                    title={cards.nextAvailable.title}
                    meta={cards.nextAvailable.meta}
                    className="top-[14%] -left-10 origin-left scale-90 sm:-left-36 sm:scale-100 lg:-left-56"
                />
                <FloatingCard
                    icon={<CalendarPlus />}
                    eyebrow={cards.calendar.eyebrow}
                    title={cards.calendar.title}
                    className="top-[58%] -left-44 hidden lg:block"
                    delay={1.6}
                />
                <FloatingCard
                    icon={<BellRing />}
                    eyebrow={cards.newBooking.eyebrow}
                    title={cards.newBooking.title}
                    meta={cards.newBooking.meta}
                    className="top-[62%] -right-10 origin-right scale-90 sm:top-[10%] sm:-right-40 sm:scale-100 lg:-right-60"
                    delay={0.8}
                />
                <FloatingCard
                    icon={<MailCheck />}
                    title={cards.confirmation.title}
                    meta={cards.confirmation.meta}
                    className="top-[52%] -right-48 hidden lg:block"
                    delay={2.4}
                />
            </div>
        </section>
    );
}

/**
 * The soft sky behind the hero: a cool gradient wash, two cloud-like blooms
 * and a horizontal band of light behind the phone. Pure CSS, no images.
 */
function SkyBackdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#d3e3fd_0%,#e9f1fe_38%,var(--background)_88%)] dark:bg-[linear-gradient(180deg,#0b1a38_0%,#0b1427_40%,var(--background)_88%)]" />
            <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-white/80 blur-3xl dark:bg-primary/15" />
            <div className="absolute top-10 -right-48 size-[32rem] rounded-full bg-white/70 blur-3xl dark:bg-primary/10" />
            <div className="absolute inset-x-[-20%] top-[62%] h-56 bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--primary)_40%,transparent)_25%,rgb(255_255_255/0.95)_50%,color-mix(in_oklab,var(--primary)_40%,transparent)_75%,transparent)] blur-3xl dark:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--primary)_35%,transparent)_35%,color-mix(in_oklab,var(--primary)_20%,transparent)_65%,transparent)]" />
        </div>
    );
}

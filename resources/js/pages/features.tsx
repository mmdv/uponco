import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    CalendarCheck,
    Check,
    Clock,
    Globe,
    Layers,
    Link2,
    MapPin,
    Rocket,
    Settings2,
    ShieldCheck,
    Sparkles,
    Users,
    Video,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, pricing, register } from '@/routes';

/** Small decorative sketch shown opposite the first pillar. */
function BookingLinkSketch() {
    const { t } = useTranslation('features');

    return (
        <div className="w-full max-w-xs">
            <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-border" />
                    <span className="size-2 rounded-full bg-border" />
                    <span className="size-2 rounded-full bg-border" />
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <Globe className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate text-xs text-muted-foreground">
                        uponco.app/
                        <span className="font-medium text-foreground">
                            bella-salon
                        </span>
                    </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {['Haircut', 'Colour', 'Shave'].map((service, i) => (
                        <span
                            key={service}
                            className={`rounded-md border px-2 py-1.5 text-center text-[10px] font-medium ${
                                i === 0
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground'
                            }`}
                        >
                            {service}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                {t('sketches.liveForCustomers')}
            </div>
        </div>
    );
}

/** Small decorative sketch shown opposite the second pillar. */
function SharedCalendarSketch() {
    const { t } = useTranslation('features');

    /** Column, row and span of each booking drawn on the mini week grid. */
    const bookings = [
        { col: 1, row: 1, span: 2, tone: 'bg-primary' },
        { col: 2, row: 3, span: 1, tone: 'bg-primary/70' },
        { col: 3, row: 2, span: 2, tone: 'bg-primary/50' },
        { col: 5, row: 1, span: 1, tone: 'bg-primary/70' },
        { col: 5, row: 4, span: 1, tone: 'bg-primary' },
    ];

    return (
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                    {t('sketches.thisWeek')}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="size-3 text-primary" />
                    {t('sketches.fourPeople')}
                </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
                {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <span
                        key={`${day}-${i}`}
                        className="text-center text-[10px] text-muted-foreground"
                    >
                        {day}
                    </span>
                ))}
            </div>
            <div className="mt-1.5 grid grid-cols-5 grid-rows-5 gap-1.5">
                {Array.from({ length: 25 }).map((_, i) => (
                    <span
                        key={i}
                        className="h-3.5 rounded-sm bg-secondary"
                        style={{
                            gridColumn: (i % 5) + 1,
                            gridRow: Math.floor(i / 5) + 1,
                        }}
                    />
                ))}
                {bookings.map((booking) => (
                    <span
                        key={`${booking.col}-${booking.row}`}
                        className={`rounded-sm ${booking.tone}`}
                        style={{
                            gridColumn: booking.col,
                            gridRow: `${booking.row} / span ${booking.span}`,
                        }}
                    />
                ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3 text-primary" />
                {t('sketches.noDoubleBookings')}
            </p>
        </div>
    );
}

/** Small decorative sketch shown opposite the third pillar. */
function LessAdminSketch() {
    const { t } = useTranslation('features');

    const handledForYou = [
        t('sketches.handled.reminders'),
        t('sketches.handled.slots'),
        t('sketches.handled.noPhoneTag'),
    ];

    return (
        <div className="w-full max-w-xs space-y-2">
            {handledForYou.map((task, i) => (
                <div
                    key={task}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-medium shadow-xs"
                    style={{ marginLeft: `${i * 0.75}rem` }}
                >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                    </span>
                    {task}
                </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                {t('sketches.inTheBackground')}
            </p>
        </div>
    );
}

const pillars: {
    icon: ReactNode;
    i18nKey: string;
    paragraphKey: string;
    sketch: ReactNode;
}[] = [
    {
        icon: <Link2 className="size-5" />,
        i18nKey: 'bookingPage',
        paragraphKey: 'paragraphOne',
        sketch: <BookingLinkSketch />,
    },
    {
        icon: <CalendarCheck className="size-5" />,
        i18nKey: 'sharedCalendar',
        paragraphKey: 'paragraphTwo',
        sketch: <SharedCalendarSketch />,
    },
    {
        icon: <Sparkles className="size-5" />,
        i18nKey: 'lessAdmin',
        paragraphKey: 'paragraphThree',
        sketch: <LessAdminSketch />,
    },
];

/**
 * One tile of the feature bento grid. `split` puts the copy and the visual
 * side by side for the wide tiles; otherwise the visual sits underneath the
 * copy and is pushed to the bottom so tiles in a row line up.
 */
function BentoCard({
    icon,
    i18nKey,
    className = '',
    split = false,
    children,
}: {
    icon: ReactNode;
    i18nKey: string;
    className?: string;
    split?: boolean;
    children: ReactNode;
}) {
    const { t } = useTranslation('features');

    const copy = (
        <div className={split ? 'lg:w-72 lg:shrink-0' : ''}>
            <h3 className="flex items-center gap-2.5 font-semibold">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </span>
                {t(`bento.items.${i18nKey}.title`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(`bento.items.${i18nKey}.description`)}
            </p>
        </div>
    );

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/30 ${className}`}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />

            {split ? (
                <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
                    {copy}
                    <div className="w-full lg:flex-1">{children}</div>
                </div>
            ) : (
                <>
                    {copy}
                    <div className="mt-6 flex flex-1 items-end">{children}</div>
                </>
            )}
        </div>
    );
}

const bentoLocations = [
    { name: 'Downtown Studio', count: '14 today', active: true },
    { name: 'Riverside Branch', count: '9 today' },
    { name: 'Airport Mall', count: '11 today' },
];

const bentoServices = [
    'Haircut · 45m',
    'Deep massage · 60m',
    'Consultation · 30m',
    'Group yoga · 90m',
    'Coaching call · 45m',
];

const howItWorksSteps: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Settings2 className="size-5" />, i18nKey: 'setUp' },
    { icon: <Link2 className="size-5" />, i18nKey: 'share' },
    { icon: <CalendarCheck className="size-5" />, i18nKey: 'run' },
];

const bentoOnboardingTaskKeys = [
    'locations',
    'services',
    'team',
    'link',
] as const;

/**
 * The full product story: what Uponco is, every feature it ships with, and how
 * a business gets from signing up to taking its first booking. The home page
 * keeps only the headlines and links here for the detail.
 */
export default function Features() {
    const { t } = useTranslation('features');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title={t('meta.title')} />

            <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
                <SiteHeader />

                {/* Hero */}
                <section className="mx-auto w-full max-w-3xl px-6 pt-14 pb-10 text-center sm:pt-20">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="size-3.5 text-primary" />
                        Uponco
                    </span>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        {t('hero.heading')}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-balance text-muted-foreground">
                        {t('hero.lead')}
                    </p>
                </section>

                {/* The three pillars, each with a small sketch */}
                <section className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
                    />

                    <div className="relative">
                        {/* Centre rail with a light travelling down it, tying
                            the alternating pillars together on wide screens. */}
                        <span
                            aria-hidden
                            className="absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 overflow-hidden bg-border lg:block"
                        >
                            <span className="absolute inset-x-0 top-0 h-1/4 animate-rail-flow bg-gradient-to-b from-transparent via-primary to-transparent motion-reduce:animate-none" />
                        </span>

                        <ol className="space-y-8 lg:space-y-14">
                            {pillars.map((pillar, i) => {
                                const flipped = i % 2 === 1;

                                return (
                                    <li
                                        key={pillar.i18nKey}
                                        className="group relative grid items-center gap-6 lg:grid-cols-2 lg:gap-16"
                                    >
                                        {/* Node sitting on the centre rail */}
                                        <span
                                            aria-hidden
                                            className="absolute top-1/2 left-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary transition-transform duration-300 group-hover:scale-125 lg:block"
                                        />

                                        <div
                                            className={`relative rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/30 sm:pl-20 ${
                                                flipped ? 'lg:order-2' : ''
                                            }`}
                                        >
                                            <span className="relative flex size-11 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-xs transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground sm:absolute sm:top-6 sm:left-5">
                                                {pillar.icon}
                                            </span>
                                            <h2 className="mt-4 font-semibold sm:mt-0">
                                                {t(`pillars.${pillar.i18nKey}`)}
                                            </h2>
                                            <p className="mt-2 leading-relaxed text-muted-foreground">
                                                {t(pillar.paragraphKey)}
                                            </p>
                                        </div>

                                        <div
                                            aria-hidden
                                            className={`flex justify-center transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transform-none ${
                                                flipped
                                                    ? 'lg:order-1 lg:justify-end'
                                                    : 'lg:justify-start'
                                            }`}
                                        >
                                            {pillar.sketch}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* Feature bento */}
                <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                            {t('bento.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('bento.subheading')}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <BentoCard
                            icon={<MapPin className="size-4" />}
                            i18nKey="multiLocation"
                            className="md:col-span-2"
                            split
                        >
                            <div className="space-y-2.5">
                                {bentoLocations.map((location) => (
                                    <div
                                        key={location.name}
                                        className={`flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 transition-transform duration-300 group-hover:translate-x-0.5 ${
                                            location.active
                                                ? 'border-primary/40 shadow-soft'
                                                : 'border-border'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            <MapPin className="size-3.5 text-primary" />
                                            {location.name}
                                        </span>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                            {location.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </BentoCard>

                        <BentoCard
                            icon={<BellRing className="size-4" />}
                            i18nKey="reminders"
                        >
                            <div className="w-full space-y-2.5">
                                <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 shadow-soft">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <BellRing className="size-4 transition-transform duration-500 group-hover:rotate-12" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold">
                                            Reminder · 24h before
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            “See you tomorrow at 10:30!”
                                        </p>
                                    </div>
                                </div>
                                <div className="mx-3 flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 opacity-70">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <BellRing className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold">
                                            Reminder · 1h before
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            “Your appointment starts soon.”
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard
                            icon={<Layers className="size-4" />}
                            i18nKey="multiService"
                        >
                            <div className="flex flex-wrap gap-2">
                                {bentoServices.map((service, i) => (
                                    <span
                                        key={service}
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                                            i === 1
                                                ? 'border-primary/40 bg-primary/10 text-primary'
                                                : 'border-border bg-background text-muted-foreground'
                                        }`}
                                    >
                                        <Clock className="size-3" />
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </BentoCard>

                        <BentoCard
                            icon={<Users className="size-4" />}
                            i18nKey="individualGroup"
                        >
                            <div className="w-full rounded-lg border border-border bg-background p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        Morning yoga
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                        Wed · 08:00
                                    </span>
                                </div>
                                <div className="mt-3 flex -space-x-2">
                                    {['AK', 'LM', 'JS', 'RB', 'TN', 'EC'].map(
                                        (initials) => (
                                            <div
                                                key={initials}
                                                className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-semibold text-secondary-foreground"
                                            >
                                                {initials}
                                            </div>
                                        ),
                                    )}
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full w-3/4 rounded-full bg-primary transition-all duration-500 group-hover:w-full" />
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {t('bento.spotsFilled')}
                                </p>
                            </div>
                        </BentoCard>

                        <BentoCard
                            icon={<Globe className="size-4" />}
                            i18nKey="onlineOnsite"
                        >
                            <div className="grid w-full grid-cols-2 gap-2.5">
                                <div className="rounded-lg border border-primary/40 bg-background p-4 shadow-soft">
                                    <Video className="size-5 text-primary" />
                                    <p className="mt-2.5 text-sm font-semibold">
                                        {t('bento.online.title')}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('bento.online.description')}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-background p-4">
                                    <MapPin className="size-5 text-primary" />
                                    <p className="mt-2.5 text-sm font-semibold">
                                        {t('bento.onsite.title')}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t('bento.onsite.description')}
                                    </p>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard
                            icon={<Rocket className="size-4" />}
                            i18nKey="onboarding"
                            className="md:col-span-2 lg:col-span-3"
                            split
                        >
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {bentoOnboardingTaskKeys.map((key) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium"
                                    >
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="size-3" />
                                        </span>
                                        {t(`bento.onboardingTasks.${key}`)}
                                    </div>
                                ))}
                            </div>
                        </BentoCard>
                    </div>
                </section>

                {/* How Uponco works */}
                <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                            {t('how.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('how.subheading')}
                        </p>
                    </div>

                    <ol className="mt-10 grid gap-6 md:grid-cols-3">
                        {howItWorksSteps.map((step, i) => (
                            <li
                                key={step.i18nKey}
                                className="relative flex flex-col"
                            >
                                <div className="group flex-1 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft motion-reduce:hover:translate-y-0">
                                    <div className="flex items-start justify-between">
                                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                            {step.icon}
                                        </span>
                                        <span className="text-4xl leading-none font-semibold text-primary/15 tabular-nums transition-colors duration-300 group-hover:text-primary/30">
                                            {`0${i + 1}`}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 font-semibold">
                                        {t(`how.steps.${step.i18nKey}.title`)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {t(
                                            `how.steps.${step.i18nKey}.description`,
                                        )}
                                    </p>
                                </div>

                                {i < howItWorksSteps.length - 1 && (
                                    <>
                                        {/* Sits in the grid gap on desktop */}
                                        <span
                                            aria-hidden
                                            className="absolute top-1/2 -right-6 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-primary md:flex"
                                        >
                                            <ArrowRight className="size-3 animate-nudge-x motion-reduce:animate-none" />
                                        </span>
                                        <span
                                            aria-hidden
                                            className="mt-3 flex justify-center text-primary md:hidden"
                                        >
                                            <span className="flex size-6 items-center justify-center rounded-full border border-border bg-background">
                                                <ArrowRight className="size-3 rotate-90" />
                                            </span>
                                        </span>
                                    </>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Closing call to action */}
                <section className="mx-auto w-full max-w-6xl px-6 pb-14">
                    <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary-gradient px-6 py-10 text-center text-white sm:px-12">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                {t('cta.heading')}
                            </h2>
                            <p className="mt-3 text-white/90">
                                {t('cta.subheading')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                            <Link
                                href={auth.user ? dashboardUrl : register()}
                                onClick={() => {
                                    if (!auth.user) {
                                        captureEvent('get_started_clicked', {
                                            placement: 'features',
                                        });
                                    }
                                }}
                                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('cta.ctaGoDashboard')
                                    : t('cta.ctaStartFree')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href={pricing()}
                                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                {t('cta.ctaPricing')}
                            </Link>
                        </div>
                    </div>
                </section>

                <SiteFooter />
            </div>
        </>
    );
}

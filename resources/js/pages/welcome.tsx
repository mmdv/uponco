import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    Building2,
    CalendarClock,
    CalendarCheck,
    Check,
    Clock,
    Globe,
    Layers,
    Link2,
    MapPin,
    Rocket,
    Scissors,
    Settings2,
    ShieldCheck,
    Sparkles,
    User,
    UserRound,
    Users,
    Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { SiteFooter, SUPPORT_EMAIL } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, pricing, privacy, register } from '@/routes';

const demoDays = [
    { label: 'Today', day: '14', month: 'Jul' },
    { label: 'Tmrw', day: '15', month: 'Jul' },
    { label: 'Wed', day: '16', month: 'Jul' },
    { label: 'Thu', day: '17', month: 'Jul' },
    { label: 'Fri', day: '18', month: 'Jul' },
];
const demoSlots = ['09:00', '09:45', '10:30', '11:15', '13:00', '13:45'];

const demoChipClass =
    'inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium shadow-xs';

/**
 * Looping mini booking flow shown in the hero, styled after the real public
 * booking page: a slot gets picked, the booking confirms, then a reminder
 * toast pops in — and it starts over.
 */
function BookingDemo() {
    const { t } = useTranslation('welcome');
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setStep((s) => (s + 1) % 4), 1700);

        return () => clearInterval(id);
    }, []);

    const slotPicked = step >= 1;
    const confirmed = step >= 2;
    const reminderSent = step >= 3;

    return (
        <div className="relative mx-auto w-full max-w-sm">
            <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl"
            />

            <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
                {/* Mirrors BookingHeader: logo tile, company name, tagline */}
                <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </span>
                    <div>
                        <p className="text-sm leading-tight font-semibold">
                            Uponco
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('demo.bookAppointment')}
                        </p>
                    </div>
                </div>

                {/* Mirrors SummaryBar: choices pop in as chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className={demoChipClass}>
                        <Scissors className="size-3.5 shrink-0 text-primary" />
                        Haircut · 45 min
                    </span>
                    <span className={demoChipClass}>
                        <User className="size-3.5 shrink-0 text-primary" />
                        Emma
                    </span>
                    {slotPicked && (
                        <span
                            className={`${demoChipClass} animate-in duration-300 zoom-in-95 fade-in motion-reduce:animate-none`}
                        >
                            <CalendarClock className="size-3.5 shrink-0 text-primary" />
                            Wed, 10:30
                        </span>
                    )}
                </div>

                {/* The step content stays mounted (hidden) while confirmed so
                    the card keeps its height and the page never shifts. */}
                <div className="relative mt-4">
                    {confirmed && (
                        /* Mirrors SuccessScreen. The animation is delayed
                           (with backwards fill) until the step content has
                           fully faded out, so the two never overlap. */
                        <div className="absolute inset-0 flex animate-in items-center justify-center delay-250 duration-500 fill-mode-backwards zoom-in-95 fade-in motion-reduce:animate-none">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="size-5" />
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold">
                                    {t('demo.bookedIn')}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Haircut · Wed, Jul 16 · 10:30
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={`flex flex-col transition-opacity duration-200 ${
                            confirmed ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        {/* Mirrors StepDateTime: day strip + slot grid */}
                        <p className="text-sm font-medium">
                            {t('demo.chooseDay')}
                        </p>
                        <div className="mt-2 flex gap-2">
                            {demoDays.map((day, i) => (
                                <div
                                    key={day.day}
                                    className={`flex w-14 flex-col items-center rounded-xl border py-2.5 transition-colors ${
                                        i === 2
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <span
                                        className={`text-[11px] ${
                                            i === 2
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {day.label}
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {day.day}
                                    </span>
                                    <span
                                        className={`text-[11px] ${
                                            i === 2
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {day.month}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-sm font-medium">
                            {t('demo.chooseTime')}
                        </p>
                        <div className="mt-2 mb-4 grid grid-cols-3 gap-2">
                            {demoSlots.map((slot, i) => (
                                <div
                                    key={slot}
                                    className={`rounded-lg border py-2 text-center text-sm font-medium transition-all duration-200 ${
                                        slotPicked && i === 2
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    {slot}
                                </div>
                            ))}
                        </div>

                        {/* Mirrors BookingFooter's primary action */}
                        <div
                            className={`mt-auto flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity duration-300 ${
                                slotPicked ? '' : 'opacity-50'
                            }`}
                        >
                            {slotPicked
                                ? t('demo.confirmBooking')
                                : t('demo.continue')}
                        </div>
                    </div>
                </div>
            </div>

            {reminderSent && (
                <div className="absolute -top-4 -right-3 flex animate-in items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium shadow-soft duration-300 fade-in slide-in-from-top-2 motion-reduce:animate-none">
                    <BellRing className="size-3.5 text-primary" />
                    {t('demo.reminderSent')}
                </div>
            )}
        </div>
    );
}

const howItWorksSteps: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Settings2 className="size-5" />, i18nKey: 'setUp' },
    { icon: <Link2 className="size-5" />, i18nKey: 'share' },
    { icon: <CalendarCheck className="size-5" />, i18nKey: 'run' },
];

const dataItems: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <UserRound className="size-4" />, i18nKey: 'account' },
    { icon: <Building2 className="size-4" />, i18nKey: 'business' },
    { icon: <CalendarClock className="size-4" />, i18nKey: 'booking' },
    { icon: <Video className="size-4" />, i18nKey: 'google' },
];

const assuranceKeys = ['noSelling', 'noAds', 'noSharing', 'deletion'] as const;

/** Small decorative sketch shown opposite the first About pillar. */
function BookingLinkSketch() {
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
                Live for your customers
            </div>
        </div>
    );
}

/** Small decorative sketch shown opposite the second About pillar. */
function SharedCalendarSketch() {
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
                <p className="text-xs font-semibold">This week</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="size-3 text-primary" />4 people
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
                No double bookings, ever
            </p>
        </div>
    );
}

/** Small decorative sketch shown opposite the third About pillar. */
function LessAdminSketch() {
    const handledForYou = [
        'Reminders sent automatically',
        'Slots kept up to date',
        'No phone tag, no back-and-forth',
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
                Uponco handles it in the background
            </p>
        </div>
    );
}

const aboutPillars: {
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
    const { t } = useTranslation('welcome');

    const copy = (
        <div className={split ? 'lg:w-72 lg:shrink-0' : ''}>
            <h3 className="flex items-center gap-2.5 font-semibold">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </span>
                {t(`features.items.${i18nKey}.title`)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(`features.items.${i18nKey}.description`)}
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

const bentoOnboardingTasks = [
    'Add your locations',
    'Create your services',
    'Invite your team',
    'Share your booking link',
];

export default function Welcome() {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Your digital bridge to your customers" />

            <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
                <SiteHeader />

                {/* Hero */}
                <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-14 pb-14 sm:pt-20 lg:grid-cols-2 lg:gap-8">
                    <div className="text-center lg:text-left">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                                <span className="relative inline-flex size-2 rounded-full bg-primary" />
                            </span>
                            {t('hero.badge')}
                        </span>

                        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
                            {t('hero.titleLead')}{' '}
                            <span className="text-primary">
                                {t('hero.titleHighlight')}
                            </span>
                        </h1>

                        <p className="mx-auto mt-5 max-w-xl text-lg text-balance text-muted-foreground lg:mx-0">
                            {t('hero.subtitle')}
                        </p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary-gradient px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                                >
                                    {t('hero.ctaGoDashboard')}
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        onClick={() =>
                                            captureEvent(
                                                'get_started_clicked',
                                                {
                                                    placement: 'hero',
                                                },
                                            )
                                        }
                                        className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary-gradient px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                                    >
                                        {t('hero.ctaStartFree')}
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="inline-flex w-full items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary sm:w-auto"
                                    >
                                        {t('hero.ctaSeeHow')}
                                    </a>
                                </>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground lg:justify-start">
                            {[
                                t('hero.trust.noCreditCard'),
                                t('hero.trust.fiveMinuteSetup'),
                                t('hero.trust.cancelAnytime'),
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <Check className="size-3.5 text-primary" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <BookingDemo />
                </section>

                {/* What Uponco does — plain, always-visible description of the
                    product, so both crawlers and reviewers can read what the
                    app actually is without interacting with anything. */}
                <section
                    id="about"
                    className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14 sm:py-20"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
                    />

                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                            <Sparkles className="size-3.5 text-primary" />
                            Uponco
                        </span>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                            {t('about.heading')}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-balance text-muted-foreground">
                            {t('about.lead')}
                        </p>
                    </div>

                    <div className="relative mt-12">
                        {/* Centre rail with a light travelling down it, tying
                            the alternating pillars together on wide screens. */}
                        <span
                            aria-hidden
                            className="absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 overflow-hidden bg-border lg:block"
                        >
                            <span className="absolute inset-x-0 top-0 h-1/4 animate-rail-flow bg-gradient-to-b from-transparent via-primary to-transparent motion-reduce:animate-none" />
                        </span>

                        <ol className="space-y-8 lg:space-y-14">
                            {aboutPillars.map((pillar, i) => {
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
                                            <h3 className="mt-4 font-semibold sm:mt-0">
                                                {t(
                                                    `about.pillars.${pillar.i18nKey}`,
                                                )}
                                            </h3>
                                            <p className="mt-2 leading-relaxed text-muted-foreground">
                                                {t(
                                                    `about.${pillar.paragraphKey}`,
                                                )}
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
                <section
                    id="features"
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14 sm:py-20"
                >
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                            {t('features.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('features.subheading')}
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
                                    6 of 8 spots filled
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
                                        Online
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Meeting link sent automatically
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-background p-4">
                                    <MapPin className="size-5 text-primary" />
                                    <p className="mt-2.5 text-sm font-semibold">
                                        Onsite
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Location shared with every booking
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
                                {bentoOnboardingTasks.map((task) => (
                                    <div
                                        key={task}
                                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium"
                                    >
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="size-3" />
                                        </span>
                                        {task}
                                    </div>
                                ))}
                            </div>
                        </BentoCard>
                    </div>
                </section>

                {/* How Uponco works */}
                <section
                    id="how-it-works"
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14 sm:py-20"
                >
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

                {/* Free 100 highlight */}
                <section className="mx-auto w-full max-w-6xl px-6 py-14">
                    <div className="flex flex-col items-center gap-8 rounded-2xl bg-primary-gradient px-6 py-10 text-white sm:px-12 lg:flex-row lg:justify-between">
                        <div className="text-center lg:text-left">
                            <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
                                100
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                {t('free100.heading')}
                            </h2>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/90 lg:justify-start">
                                {[
                                    t('free100.items.noPayment'),
                                    t('free100.items.allFeatures'),
                                    t('free100.items.payAsYouGrow'),
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-1.5"
                                    >
                                        <Check className="size-4" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
                            <Link
                                href={auth.user ? dashboardUrl : register()}
                                onClick={() => {
                                    if (!auth.user) {
                                        captureEvent('get_started_clicked', {
                                            placement: 'free_100',
                                        });
                                    }
                                }}
                                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('free100.ctaGoDashboard')
                                    : t('free100.ctaClaim')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href={pricing()}
                                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                {t('free100.ctaPricing')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Data transparency — spells out what Uponco collects and
                    why, including the exact Google scopes we request, and
                    links out to the full Privacy Policy. */}
                <section
                    id="your-data"
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14"
                >
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </span>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                            {t('data.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('data.subheading')}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-2">
                        {dataItems.map((item) => (
                            <div
                                key={item.i18nKey}
                                className="rounded-xl border border-border bg-card p-6"
                            >
                                <h3 className="flex items-center gap-2.5 font-semibold">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {item.icon}
                                    </span>
                                    {t(`data.items.${item.i18nKey}.title`)}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {t(
                                        `data.items.${item.i18nKey}.description`,
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-6 sm:p-8">
                        <h3 className="font-semibold">
                            {t('data.assurance.heading')}
                        </h3>
                        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                            {assuranceKeys.map((key) => (
                                <li
                                    key={key}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t(`data.assurance.items.${key}`)}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 flex flex-col items-start gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('data.contactLead')}{' '}
                                <a
                                    href={`mailto:${SUPPORT_EMAIL}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {SUPPORT_EMAIL}
                                </a>
                            </p>
                            <Link
                                href={privacy()}
                                className="group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                                {t('data.privacyCta')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                <SiteFooter />
            </div>
        </>
    );
}

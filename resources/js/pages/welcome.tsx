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

const spotlightFeatures: {
    icon: ReactNode;
    i18nKey: string;
    visual: ReactNode;
}[] = [
    {
        icon: <MapPin className="size-4" />,
        i18nKey: 'multiLocation',
        visual: (
            <div className="w-full max-w-xs space-y-2.5">
                {[
                    {
                        name: 'Downtown Studio',
                        count: '14 today',
                        active: true,
                    },
                    { name: 'Riverside Branch', count: '9 today' },
                    { name: 'Airport Mall', count: '11 today' },
                ].map((location) => (
                    <div
                        key={location.name}
                        className={`flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 ${
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
        ),
    },
    {
        icon: <Layers className="size-4" />,
        i18nKey: 'multiService',
        visual: (
            <div className="flex max-w-xs flex-wrap justify-center gap-2">
                {[
                    'Haircut · 45m',
                    'Deep massage · 60m',
                    'Consultation · 30m',
                    'Group yoga · 90m',
                    'Coaching call · 45m',
                    'Follow-up · 15m',
                ].map((service, i) => (
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
        ),
    },
    {
        icon: <Users className="size-4" />,
        i18nKey: 'individualGroup',
        visual: (
            <div className="w-full max-w-xs rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Morning yoga</p>
                    <span className="text-xs text-muted-foreground">
                        Wed · 08:00
                    </span>
                </div>
                <div className="mt-3 flex -space-x-2">
                    {['AK', 'LM', 'JS', 'RB', 'TN', 'EC'].map((initials) => (
                        <div
                            key={initials}
                            className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-semibold text-secondary-foreground"
                        >
                            {initials}
                        </div>
                    ))}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    6 of 8 spots filled
                </p>
            </div>
        ),
    },
    {
        icon: <Globe className="size-4" />,
        i18nKey: 'onlineOnsite',
        visual: (
            <div className="grid w-full max-w-xs grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-primary/40 bg-background p-4 shadow-soft">
                    <Video className="size-5 text-primary" />
                    <p className="mt-2.5 text-sm font-semibold">Online</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Meeting link sent automatically
                    </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                    <MapPin className="size-5 text-primary" />
                    <p className="mt-2.5 text-sm font-semibold">Onsite</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Location shared with every booking
                    </p>
                </div>
            </div>
        ),
    },
    {
        icon: <BellRing className="size-4" />,
        i18nKey: 'reminders',
        visual: (
            <div className="w-full max-w-xs space-y-2.5">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 shadow-soft">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BellRing className="size-4" />
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
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
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
        ),
    },
    {
        icon: <Rocket className="size-4" />,
        i18nKey: 'onboarding',
        visual: (
            <div className="w-full max-w-xs space-y-2">
                {[
                    'Add your locations',
                    'Create your services',
                    'Invite your team',
                    'Share your booking link',
                ].map((task) => (
                    <div
                        key={task}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium"
                    >
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                        </span>
                        {task}
                    </div>
                ))}
                <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Rocket className="size-3.5 text-primary" />
                    Ready in about 5 minutes
                </p>
            </div>
        ),
    },
];

/**
 * Auto-advancing feature carousel. Clicking a tab jumps to it; hovering
 * pauses the rotation.
 */
function FeatureSpotlight() {
    const { t } = useTranslation('welcome');
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) {
            return;
        }

        const id = setTimeout(
            () => setActive((i) => (i + 1) % spotlightFeatures.length),
            5000,
        );

        return () => clearTimeout(id);
    }, [active, paused]);

    const feature = spotlightFeatures[active];

    return (
        <div
            className="mt-10 grid gap-4 lg:grid-cols-[2fr_3fr]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {spotlightFeatures.map((item, i) => (
                    <button
                        key={item.i18nKey}
                        type="button"
                        onClick={() => setActive(i)}
                        className={`relative shrink-0 overflow-hidden rounded-lg border text-left transition-colors ${
                            i === active
                                ? 'border-primary/40 bg-secondary'
                                : 'border-transparent hover:bg-secondary/60'
                        }`}
                    >
                        <span className="flex items-center gap-2.5 px-3.5 py-2.5 lg:py-3">
                            <span
                                className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                                    i === active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-primary/10 text-primary'
                                }`}
                            >
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap">
                                {t(`features.items.${item.i18nKey}.title`)}
                            </span>
                        </span>
                        {i === active && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-border">
                                <span
                                    key={active}
                                    className={`block h-full animate-progress-fill bg-primary motion-reduce:w-full motion-reduce:animate-none ${
                                        paused
                                            ? '[animation-play-state:paused]'
                                            : ''
                                    }`}
                                />
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-6 sm:p-8">
                <div
                    key={active}
                    className="flex h-full animate-in flex-col duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
                >
                    <div className="flex min-h-56 flex-1 items-center justify-center py-2">
                        {feature.visual}
                    </div>
                    <p className="mt-4 text-center text-sm text-balance text-muted-foreground">
                        {t(`features.items.${feature.i18nKey}.description`)}
                    </p>
                </div>
            </div>
        </div>
    );
}

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
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14"
                >
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {t('about.heading')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {t('about.lead')}
                        </p>
                        <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
                            <p>{t('about.paragraphOne')}</p>
                            <p>{t('about.paragraphTwo')}</p>
                            <p>{t('about.paragraphThree')}</p>
                        </div>
                    </div>
                </section>

                {/* How Uponco works */}
                <section
                    id="how-it-works"
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14"
                >
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {t('how.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('how.subheading')}
                        </p>
                    </div>

                    <ol className="mt-10 grid gap-5 md:grid-cols-3">
                        {howItWorksSteps.map((step, i) => (
                            <li
                                key={step.i18nKey}
                                className="rounded-xl border border-border bg-card p-6"
                            >
                                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {step.icon}
                                </span>
                                <h3 className="mt-4 font-semibold">
                                    {i + 1}.{' '}
                                    {t(`how.steps.${step.i18nKey}.title`)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(`how.steps.${step.i18nKey}.description`)}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Feature spotlight */}
                <section
                    id="features"
                    className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-14"
                >
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {t('features.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('features.subheading')}
                        </p>
                    </div>

                    <FeatureSpotlight />
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

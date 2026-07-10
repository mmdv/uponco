import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    CalendarCheck,
    Check,
    Clock,
    Globe,
    Layers,
    MapPin,
    Rocket,
    Users,
    Video,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard, login, privacy, register, terms } from '@/routes';

const currentYear = new Date().getFullYear();

const demoDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const demoSlots = ['09:00', '09:45', '10:30', '11:15', '13:00', '13:45'];

/**
 * Looping mini booking flow shown in the hero: a slot gets picked, the
 * booking confirms, then a reminder toast pops in — and it starts over.
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
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-gradient text-sm font-semibold text-white">
                        GS
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Glow Studio</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            Haircut · 45 min · Downtown
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-1.5">
                    {demoDays.map((day, i) => (
                        <div
                            key={day}
                            className={`rounded-md py-1.5 text-center text-xs font-medium transition-colors ${
                                i === 2
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground'
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {demoSlots.map((slot, i) => (
                        <div
                            key={slot}
                            className={`rounded-md border py-2 text-center text-xs font-medium transition-all duration-300 ${
                                slotPicked && i === 2
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground'
                            }`}
                        >
                            {slot}
                        </div>
                    ))}
                </div>

                <div className="mt-4 h-11">
                    {confirmed ? (
                        <div className="flex h-full animate-in items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground duration-300 zoom-in-95 motion-reduce:animate-none">
                            <CalendarCheck className="size-4" />
                            Booked — Wed, 10:30
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                            {slotPicked
                                ? t('demo.confirming')
                                : t('demo.pickTime')}
                        </div>
                    )}
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
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
                    <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-5 fill-current text-white" />
                            </span>
                            <span>Uponco</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <LanguageSwitcher />
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    {t('nav.dashboard')}
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {t('nav.signIn')}
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        {t('nav.getStarted')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

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
                        <Link
                            href={auth.user ? dashboardUrl : register()}
                            className="group inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                        >
                            {auth.user
                                ? t('free100.ctaGoDashboard')
                                : t('free100.ctaClaim')}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/60">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-3.5 fill-current text-white" />
                            </span>
                            Uponco
                        </div>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                            <div className="flex items-center gap-5 text-sm text-muted-foreground">
                                <Link
                                    href={privacy()}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {t('footer.privacy')}
                                </Link>
                                <Link
                                    href={terms()}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {t('footer.terms')}
                                </Link>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                © {currentYear} {t('footer.copyright')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    CalendarCheck,
    Check,
    Link2,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AppBackground from '@/components/app-background';
import CountUp from '@/components/count-up';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import {
    dashboard,
    features,
    login,
    pricing,
    register,
    yourData,
} from '@/routes';

/** The three things worth knowing before clicking through to /features. */
const valueItems: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Link2 className="size-6" />, i18nKey: 'bookingPage' },
    { icon: <CalendarCheck className="size-6" />, i18nKey: 'sharedCalendar' },
    { icon: <BellRing className="size-6" />, i18nKey: 'reminders' },
];

const setupSteps: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Settings2 className="size-6" />, i18nKey: 'setUp' },
    { icon: <Link2 className="size-6" />, i18nKey: 'share' },
    { icon: <CalendarCheck className="size-6" />, i18nKey: 'run' },
];

/**
 * Home page. Deliberately short: it shows what Uponco is, the three things
 * that matter most to a business deciding to sign up, and the free 100
 * appointments. Everything else lives on /features, /pricing and /your-data.
 */
export default function Welcome() {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard() : '/';

    return (
        <>
            <Head title={t('metaTitle')} />

            <AppBackground className="min-h-screen w-full max-w-full overflow-x-hidden text-foreground">
                <SiteHeader transparent maxWidth="max-w-7xl" />

                {/* Hero. Pulled up under the (transparent) header with -mt-20 so
                    the artwork starts at the very top of the page. The desktop
                    ratio is dynamic, getting taller as the viewport narrows so
                    the copy keeps its room: 16:12 on lg (1024–1279), 16:9 on xl
                    (1280–1439), and a wide 16:8 from 1440px up. On smaller
                    screens the copy drives the height and the right-aligned art
                    fills it. Content is vertically centered.
                    The `!` is required: Tailwind emits the arbitrary min-[1440px]
                    rule before the lg/xl rules, so without it the xl ratio would
                    win the cascade at >=1440px. */}
                <section className="relative isolate -mt-20 flex min-h-[85svh] items-center py-16 min-[1440px]:aspect-[16/8]! sm:min-h-[80svh] lg:aspect-[16/12] lg:min-h-0 lg:py-0 xl:aspect-[16/9]">
                    {/* Full-bleed hero art covering the header and hero copy.
                        Light/dark variants swap with the theme; the
                        left-to-right fade keeps the copy legible over it. */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
                    >
                        {/* The mask fades the image's own alpha to transparent
                            across its bottom fifth, so the artwork dissolves into
                            the page background instead of being covered by a dark
                            overlay — no visible seam in either theme. */}
                        <img
                            src="/images/light.jpg"
                            alt=""
                            className="size-full [mask-image:linear-gradient(to_bottom,#000_80%,transparent_100%)] object-cover object-right dark:hidden"
                        />
                        <img
                            src="/images/dark.jpg"
                            alt=""
                            className="hidden size-full [mask-image:linear-gradient(to_bottom,#000_80%,transparent_100%)] object-cover object-right dark:block"
                        />
                        {/* Legibility overlay for the copy. On desktop it runs
                            diagonally from the opaque top-left and is fully
                            transparent by 60%, so the artwork in the lower-right
                            stays clear. */}
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:bg-gradient-to-br lg:via-background/0 lg:via-60% lg:to-transparent" />
                    </div>

                    <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
                        {/* Desktop only: a mild glass panel keeps the copy
                            readable where the artwork shows through. On mobile
                            the copy sits directly on the full-bleed overlay,
                            with no panel or blur. */}
                        <div className="text-center lg:rounded-3xl lg:border lg:border-border/50 lg:bg-background/25 lg:py-20 lg:pr-10 lg:pl-12 lg:text-left lg:shadow-sm lg:backdrop-blur-sm">
                            {/* Free-appointments pill, built as a two-segment
                                "ticket": a solid gradient tag carries the word
                                FREE, the rest of the offer sits on the pill
                                itself with the 100 in gradient type. No icon —
                                a lone glyph next to wrapping text read as
                                mis-centred on phones — and no counter, so the
                                offer is legible the instant the page paints. A
                                soft primary glow lifts it off the hero art.
                                The "no card required" half of the old copy now
                                lives once, in the trust row below. */}
                            <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/50 py-1 pr-4 pl-1 text-sm shadow-soft backdrop-blur-sm sm:text-base">
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute -inset-px -z-10 rounded-full bg-primary/20 opacity-70 blur-md"
                                />
                                <span className="rounded-full bg-primary-gradient px-3 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                                    {t('hero.badge.tag')}
                                </span>
                                <span className="font-medium text-foreground">
                                    {t('hero.badge.lead')}{' '}
                                    <span className="bg-primary-gradient bg-clip-text text-base font-bold text-transparent tabular-nums sm:text-lg">
                                        100
                                    </span>{' '}
                                    {t('hero.badge.trail')}
                                </span>
                            </span>

                            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
                                {t('hero.titleLead')}{' '}
                                <span className="text-primary">
                                    {t('hero.titleHighlight')}
                                </span>
                            </h1>

                            <p className="mx-auto mt-5 max-w-xl text-lg text-balance text-foreground lg:mx-0">
                                {t('hero.subtitle')}
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                                {auth.user ? (
                                    <Link
                                        href={dashboardUrl}
                                        className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary-gradient px-7 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
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
                                            className="group inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary-gradient px-7 py-3.5 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
                                        >
                                            {t('hero.ctaStartFree')}
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex w-full items-center justify-center rounded-md border border-primary px-7 py-[13px] text-base font-medium text-primary transition-colors hover:bg-primary hover:text-white sm:w-auto"
                                        >
                                            {t('hero.ctaLogin')}
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-foreground lg:justify-start">
                                {[
                                    t('hero.trust.noCreditCard'),
                                    t('hero.trust.fiveMinuteSetup'),
                                    t('hero.trust.cancelAnytime'),
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-1.5"
                                    >
                                        <Check className="size-4 text-primary" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right column is intentionally empty on desktop so the
                        hero artwork (the section background) reads through. */}
                        <div aria-hidden className="hidden lg:block" />
                    </div>
                </section>

                {/* Three headline benefits, with the detail one click away */}
                <section className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            {t('value.heading')}
                        </h2>
                        <p className="mt-4 text-lg text-foreground">
                            {t('value.subheading')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {valueItems.map((item) => (
                            <div
                                key={item.i18nKey}
                                className="group rounded-3xl border border-border/50 bg-card/60 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft motion-reduce:hover:translate-y-0"
                            >
                                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    {item.icon}
                                </span>
                                <h3 className="mt-6 text-lg font-semibold">
                                    {t(`value.items.${item.i18nKey}.title`)}
                                </h3>
                                <p className="mt-2 text-base leading-relaxed text-foreground">
                                    {t(
                                        `value.items.${item.i18nKey}.description`,
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href={features()}
                            className="group inline-flex items-center gap-1.5 rounded-md border border-border px-6 py-3 text-base font-medium transition-colors hover:bg-secondary"
                        >
                            {t('value.cta')}
                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                {/* Setup in three lines — the "is this a lot of work?" answer */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-14">
                    <div className="rounded-3xl border border-border/50 bg-secondary/30 p-8 shadow-sm backdrop-blur-md sm:p-12">
                        <div className="text-center">
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('setup.heading')}
                            </h2>
                            <p className="mt-4 text-lg text-foreground">
                                {t('setup.subheading')}
                            </p>
                        </div>

                        <ol className="mt-10 grid gap-5 md:grid-cols-3">
                            {setupSteps.map((step, i) => (
                                <li
                                    key={step.i18nKey}
                                    className="flex items-start gap-4"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        {step.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-primary tabular-nums">
                                            {`0${i + 1}`}
                                        </p>
                                        <h3 className="mt-0.5 text-lg font-semibold">
                                            {t(
                                                `setup.steps.${step.i18nKey}.title`,
                                            )}
                                        </h3>
                                        <p className="mt-1 text-base leading-relaxed text-foreground">
                                            {t(
                                                `setup.steps.${step.i18nKey}.description`,
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Free 100 highlight */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-14">
                    <div className="flex flex-col items-center gap-8 rounded-2xl bg-primary-gradient px-6 py-10 text-white sm:px-12 lg:flex-row lg:justify-between">
                        <div className="text-center lg:text-left">
                            <p className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                                <CountUp to={100} />
                            </p>
                            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('free100.heading')}
                            </h2>
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-base text-white/90 lg:justify-start">
                                {[
                                    t('free100.items.noPayment'),
                                    t('free100.items.allFeatures'),
                                    t('free100.items.payAsYouGrow'),
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="inline-flex items-center gap-1.5"
                                    >
                                        <Check className="size-5" />
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
                                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-7 py-3.5 text-base font-semibold text-primary transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('free100.ctaGoDashboard')
                                    : t('free100.ctaClaim')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href={pricing()}
                                className="inline-flex items-center justify-center rounded-md border border-white/40 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
                            >
                                {t('free100.ctaPricing')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* One-line data promise, with the full detail on /your-data */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-14">
                    <div className="flex flex-col items-start gap-5 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-10">
                        <div className="flex items-start gap-4">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <ShieldCheck className="size-7" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('dataStrip.heading')}
                                </h2>
                                <p className="mt-1 text-base leading-relaxed text-foreground">
                                    {t('dataStrip.description')}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={yourData()}
                            className="group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-secondary"
                        >
                            {t('dataStrip.cta')}
                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                <SiteFooter maxWidth="max-w-7xl" />
            </AppBackground>
        </>
    );
}

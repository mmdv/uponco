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
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, features, pricing, register, yourData } from '@/routes';

/** The three things worth knowing before clicking through to /features. */
const valueItems: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Link2 className="size-5" />, i18nKey: 'bookingPage' },
    { icon: <CalendarCheck className="size-5" />, i18nKey: 'sharedCalendar' },
    { icon: <BellRing className="size-5" />, i18nKey: 'reminders' },
];

const setupSteps: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Settings2 className="size-5" />, i18nKey: 'setUp' },
    { icon: <Link2 className="size-5" />, i18nKey: 'share' },
    { icon: <CalendarCheck className="size-5" />, i18nKey: 'run' },
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
                                    <Link
                                        href={features()}
                                        className="inline-flex w-full items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary sm:w-auto"
                                    >
                                        {t('hero.ctaSeeHow')}
                                    </Link>
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

                    {/* Placeholder for the hero graphic — swap the img src once
                        the final artwork is ready. */}
                    <div className="relative mx-auto w-full max-w-sm">
                        <div
                            aria-hidden
                            className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl"
                        />
                        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card">
                            <img
                                src="/images/hero-placeholder.svg"
                                alt=""
                                className="size-full rounded-2xl object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Three headline benefits, with the detail one click away */}
                <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                            {t('value.heading')}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {t('value.subheading')}
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {valueItems.map((item) => (
                            <div
                                key={item.i18nKey}
                                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft motion-reduce:hover:translate-y-0"
                            >
                                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    {item.icon}
                                </span>
                                <h3 className="mt-5 font-semibold">
                                    {t(`value.items.${item.i18nKey}.title`)}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(
                                        `value.items.${item.i18nKey}.description`,
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href={features()}
                            className="group inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                        >
                            {t('value.cta')}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                {/* Setup in three lines — the "is this a lot of work?" answer */}
                <section className="mx-auto w-full max-w-6xl px-6 pb-14">
                    <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                {t('setup.heading')}
                            </h2>
                            <p className="mt-3 text-muted-foreground">
                                {t('setup.subheading')}
                            </p>
                        </div>

                        <ol className="mt-8 grid gap-4 md:grid-cols-3">
                            {setupSteps.map((step, i) => (
                                <li
                                    key={step.i18nKey}
                                    className="flex items-start gap-3.5 rounded-xl border border-border bg-background p-5"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {step.icon}
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold text-primary tabular-nums">
                                            {`0${i + 1}`}
                                        </p>
                                        <h3 className="mt-0.5 font-semibold">
                                            {t(
                                                `setup.steps.${step.i18nKey}.title`,
                                            )}
                                        </h3>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
                <section className="mx-auto w-full max-w-6xl px-6 pb-14">
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

                {/* One-line data promise, with the full detail on /your-data */}
                <section className="mx-auto w-full max-w-6xl px-6 pb-14">
                    <div className="flex flex-col items-start gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                        <div className="flex items-start gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-semibold">
                                    {t('dataStrip.heading')}
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {t('dataStrip.description')}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={yourData()}
                            className="group inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                        >
                            {t('dataStrip.cta')}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>

                <SiteFooter />
            </AppBackground>
        </>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    Link2,
    Settings2,
    Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { FeatureBento } from '@/components/marketing/feature-bento';
import { FeaturePillars } from '@/components/marketing/feature-pillars';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, pricing, register } from '@/routes';

const howItWorksSteps: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <Settings2 className="size-6" />, i18nKey: 'setUp' },
    { icon: <Link2 className="size-6" />, i18nKey: 'share' },
    { icon: <CalendarCheck className="size-6" />, i18nKey: 'run' },
];

/**
 * The full product story: what Uponco is, every feature it ships with, and how
 * a business gets from signing up to taking its first booking. The home page
 * keeps only the headlines and links here for the detail.
 */
export default function Features() {
    const { t } = useTranslation('features');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard() : '/';

    return (
        <>
            <Head title={t('meta.title')} />

            <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
                <SiteHeader maxWidth="max-w-7xl" />

                {/* Hero */}
                <section className="mx-auto w-full max-w-3xl px-6 pt-14 pb-10 text-center sm:pt-20">
                    <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
                        <Sparkles className="size-4 text-primary" />
                        Uponco
                    </span>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                        {t('hero.heading')}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-xl text-balance text-foreground/80">
                        {t('hero.lead')}
                    </p>
                </section>

                <FeaturePillars />

                <FeatureBento />

                {/* How Uponco works */}
                <section className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                            {t('how.heading')}
                        </h2>
                        <p className="mt-4 text-lg text-foreground/80">
                            {t('how.subheading')}
                        </p>
                    </div>

                    <ol className="mt-12 grid gap-6 md:grid-cols-3">
                        {howItWorksSteps.map((step, i) => (
                            <li
                                key={step.i18nKey}
                                className="relative flex flex-col"
                            >
                                <div className="group flex-1 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft motion-reduce:hover:translate-y-0">
                                    <div className="flex items-start justify-between">
                                        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                            {step.icon}
                                        </span>
                                        <span className="text-5xl leading-none font-semibold text-primary/15 tabular-nums transition-colors duration-300 group-hover:text-primary/30">
                                            {`0${i + 1}`}
                                        </span>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold">
                                        {t(`how.steps.${step.i18nKey}.title`)}
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed text-foreground/70">
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
                <section className="mx-auto w-full max-w-7xl px-6 pb-14">
                    <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary-gradient px-6 py-12 text-center text-white sm:px-12">
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                                {t('cta.heading')}
                            </h2>
                            <p className="mt-4 text-lg text-white/90">
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
                                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-7 py-3.5 text-base font-semibold text-primary transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('cta.ctaGoDashboard')
                                    : t('cta.ctaStartFree')}
                                <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href={pricing()}
                                className="inline-flex items-center justify-center rounded-md border border-white/40 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
                            >
                                {t('cta.ctaPricing')}
                            </Link>
                        </div>
                    </div>
                </section>

                <SiteFooter maxWidth="max-w-7xl" />
            </div>
        </>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, home, register } from '@/routes';

const includedKeys = [
    'multiLocation',
    'team',
    'individualGroup',
    'onlineOnsite',
    'reminders',
    'widget',
    'google',
    'languages',
] as const;

const faqKeys = ['counts', 'afterFree', 'whoIsAUser', 'cancel'] as const;

const freePlanFeatures = [
    'appointments',
    'allFeatures',
    'noCard',
    'publicPage',
] as const;

const growthPlanFeatures = [
    'unlimited',
    'perUser',
    'everything',
    'cancel',
] as const;

/**
 * Public pricing page. Uponco is free during beta, so the page states that
 * plainly rather than advertising a plan nobody is charged for yet.
 */
export default function Pricing() {
    const { t } = useTranslation('pricing');
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
                        {t('hero.badge')}
                    </span>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        {t('hero.heading')}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-balance text-muted-foreground">
                        {t('hero.subtitle')}
                    </p>
                </section>

                {/* Plans */}
                <section className="mx-auto w-full max-w-5xl px-6 pb-10">
                    <div className="grid gap-5 lg:grid-cols-2">
                        {/* Free */}
                        <div className="flex flex-col rounded-2xl border border-primary/40 bg-card p-8 shadow-soft">
                            <p className="text-sm font-semibold text-primary">
                                {t('plans.free.name')}
                            </p>
                            <p className="mt-3 flex items-baseline gap-2">
                                <span className="text-4xl font-semibold tracking-tight">
                                    {t('plans.free.price')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {t('plans.free.period')}
                                </span>
                            </p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t('plans.free.tagline')}
                            </p>
                            <ul className="mt-6 flex-1 space-y-3 text-sm">
                                {freePlanFeatures.map((key) => (
                                    <li
                                        key={key}
                                        className="flex items-start gap-2.5"
                                    >
                                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                        {t(`plans.free.features.${key}`)}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={auth.user ? dashboardUrl : register()}
                                onClick={() => {
                                    if (!auth.user) {
                                        captureEvent('get_started_clicked', {
                                            placement: 'pricing_free',
                                        });
                                    }
                                }}
                                className="group mt-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-gradient px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('cta.dashboard')
                                    : t('plans.free.cta')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>

                        {/* Per user */}
                        <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
                            <p className="text-sm font-semibold text-muted-foreground">
                                {t('plans.growth.name')}
                            </p>
                            <p className="mt-3 flex items-baseline gap-2">
                                <span className="text-4xl font-semibold tracking-tight">
                                    {t('plans.growth.price')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {t('plans.growth.period')}
                                </span>
                            </p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t('plans.growth.tagline')}
                            </p>
                            <ul className="mt-6 flex-1 space-y-3 text-sm">
                                {growthPlanFeatures.map((key) => (
                                    <li
                                        key={key}
                                        className="flex items-start gap-2.5"
                                    >
                                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                        {t(`plans.growth.features.${key}`)}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={auth.user ? dashboardUrl : register()}
                                onClick={() => {
                                    if (!auth.user) {
                                        captureEvent('get_started_clicked', {
                                            placement: 'pricing_growth',
                                        });
                                    }
                                }}
                                className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                            >
                                {auth.user
                                    ? t('cta.dashboard')
                                    : t('plans.growth.cta')}
                            </Link>
                        </div>
                    </div>

                    {/* Beta disclosure — keeps the page accurate while nobody is billed */}
                    <div className="mt-5 rounded-2xl border border-border bg-secondary/50 p-6 sm:p-8">
                        <h2 className="text-lg font-semibold tracking-tight">
                            {t('beta.heading')}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {t('beta.description')}
                        </p>
                    </div>
                </section>

                {/* Included in every plan */}
                <section className="mx-auto w-full max-w-5xl px-6 py-10">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {t('included.heading')}
                    </h2>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                        {includedKeys.map((key) => (
                            <li
                                key={key}
                                className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                            >
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                {t(`included.items.${key}`)}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* FAQ */}
                <section className="mx-auto w-full max-w-3xl px-6 py-10">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {t('faq.heading')}
                    </h2>
                    <dl className="mt-6 space-y-6">
                        {faqKeys.map((key) => (
                            <div
                                key={key}
                                className="border-b border-border/60 pb-6 last:border-b-0 last:pb-0"
                            >
                                <dt className="text-base font-medium">
                                    {t(`faq.items.${key}.question`)}
                                </dt>
                                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {t(`faq.items.${key}.answer`)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Closing CTA */}
                <section className="mx-auto w-full max-w-5xl px-6 py-14">
                    <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary-gradient px-6 py-10 text-center text-white sm:px-12">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                {t('cta.heading')}
                            </h2>
                            <p className="mt-2 text-sm text-white/90">
                                {t('cta.subtitle')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                            <Link
                                href={auth.user ? dashboardUrl : register()}
                                onClick={() => {
                                    if (!auth.user) {
                                        captureEvent('get_started_clicked', {
                                            placement: 'pricing_footer',
                                        });
                                    }
                                }}
                                className="group inline-flex items-center justify-center gap-1.5 rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
                            >
                                {auth.user
                                    ? t('cta.dashboard')
                                    : t('cta.primary')}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href={home()}
                                className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                {t('cta.secondary')}
                            </Link>
                        </div>
                    </div>
                </section>

                <SiteFooter />
            </div>
        </>
    );
}

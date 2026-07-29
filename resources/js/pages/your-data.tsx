import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarClock,
    Check,
    ShieldCheck,
    UserRound,
    Video,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteFooter, SUPPORT_EMAIL } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { privacy, terms } from '@/routes';

const dataItems: { icon: ReactNode; i18nKey: string }[] = [
    { icon: <UserRound className="size-4" />, i18nKey: 'account' },
    { icon: <Building2 className="size-4" />, i18nKey: 'business' },
    { icon: <CalendarClock className="size-4" />, i18nKey: 'booking' },
    { icon: <Video className="size-4" />, i18nKey: 'google' },
];

const assuranceKeys = ['noSelling', 'noAds', 'noSharing', 'deletion'] as const;

/**
 * Spells out what Uponco collects and why, including the exact Google scopes
 * we request. It lives on its own URL so the home page stays short and so the
 * Google OAuth reviewer has a single page to read while logged out.
 */
export default function YourData() {
    const { t } = useTranslation('data');

    return (
        <>
            <Head title={t('meta.title')} />

            <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
                <SiteHeader />

                {/* Hero */}
                <section className="mx-auto w-full max-w-3xl px-6 pt-14 pb-10 text-center sm:pt-20">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </span>
                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                        {t('heading')}
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-balance text-muted-foreground">
                        {t('subheading')}
                    </p>
                </section>

                {/* What we collect, item by item */}
                <section className="mx-auto w-full max-w-5xl px-6 pb-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {dataItems.map((item) => (
                            <div
                                key={item.i18nKey}
                                className="rounded-xl border border-border bg-card p-6"
                            >
                                <h2 className="flex items-center gap-2.5 font-semibold">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {item.icon}
                                    </span>
                                    {t(`items.${item.i18nKey}.title`)}
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                    {t(`items.${item.i18nKey}.description`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* What we never do, plus the links to the full documents */}
                <section className="mx-auto w-full max-w-5xl px-6 py-10">
                    <div className="rounded-xl border border-border bg-secondary/50 p-6 sm:p-8">
                        <h2 className="font-semibold">
                            {t('assurance.heading')}
                        </h2>
                        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                            {assuranceKeys.map((key) => (
                                <li
                                    key={key}
                                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    {t(`assurance.items.${key}`)}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 flex flex-col items-start gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t('contactLead')}{' '}
                                <a
                                    href={`mailto:${SUPPORT_EMAIL}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {SUPPORT_EMAIL}
                                </a>
                            </p>
                            <div className="flex shrink-0 flex-wrap gap-3">
                                <Link
                                    href={privacy()}
                                    className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                                >
                                    {t('privacyCta')}
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                                <Link
                                    href={terms()}
                                    className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                                >
                                    {t('termsCta')}
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <SiteFooter />
            </div>
        </>
    );
}

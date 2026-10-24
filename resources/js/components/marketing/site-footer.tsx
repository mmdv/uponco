import { Link } from '@inertiajs/react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { features, pricing, privacy, terms, yourData } from '@/routes';
import { show as publicBookingPage } from '@/routes/public/appointments';

const currentYear = new Date().getFullYear();

/** Support address shown publicly so visitors can identify and reach us. */
export const SUPPORT_EMAIL = 'support@uponco.com';

/** The fictional demo business behind the "Live demo" link (StudioNorthSeeder). */
export const DEMO_TEAM_SLUG = 'studio-north';

type FooterLink = { label: string } & (
    { href: ReturnType<typeof features> } | { external: string }
);

/**
 * Public marketing footer shared by the welcome, pricing and legal pages:
 * brand and tagline, then Product / Company / Legal columns. The Privacy
 * Policy link is spelled out in full because it doubles as the policy link
 * declared on our Google OAuth consent screen.
 *
 * `maxWidth` lines the footer up with the container of the page it sits under —
 * the legal documents are narrower than the marketing pages.
 */
export function SiteFooter({ maxWidth = 'max-w-6xl' }: { maxWidth?: string }) {
    const { t } = useTranslation('welcome');

    const columns: { heading: string; links: FooterLink[] }[] = [
        {
            heading: t('footer.product'),
            links: [
                { href: features(), label: t('footer.features') },
                { href: pricing(), label: t('footer.pricing') },
                {
                    external: publicBookingPage(DEMO_TEAM_SLUG).url,
                    label: t('footer.liveDemo'),
                },
            ],
        },
        {
            heading: t('footer.company'),
            links: [
                { href: yourData(), label: t('footer.yourData') },
                {
                    external: `mailto:${SUPPORT_EMAIL}`,
                    label: t('footer.contact'),
                },
            ],
        },
        {
            heading: t('footer.legal'),
            links: [
                { href: terms(), label: t('footer.terms') },
                { href: privacy(), label: t('footer.privacy') },
            ],
        },
    ];

    return (
        <footer className="border-t border-border/60">
            <div className={`mx-auto w-full ${maxWidth} px-6 py-14 sm:py-16`}>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-16">
                    <div className="max-w-sm sm:col-span-2 lg:col-span-1">
                        <img
                            src="/icons/horizontal-logo.svg"
                            alt="Uponco"
                            className="h-8 w-auto"
                        />
                        <p className="mt-4 text-base leading-relaxed text-foreground">
                            {t('footer.tagline')}
                        </p>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="mt-4 inline-block text-base font-medium text-primary hover:underline"
                        >
                            {SUPPORT_EMAIL}
                        </a>
                    </div>

                    {columns.map((column) => (
                        <nav key={column.heading} aria-label={column.heading}>
                            <p className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                {column.heading}
                            </p>
                            <ul className="mt-4 flex flex-col gap-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        {'href' in link ? (
                                            <Link
                                                href={link.href}
                                                className="text-base text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.external}
                                                className="text-base text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} {t('footer.copyright')}
                    </p>
                    <LanguageSwitcher />
                </div>
            </div>
        </footer>
    );
}

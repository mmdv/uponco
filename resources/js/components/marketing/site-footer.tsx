import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useTranslation } from '@/hooks/use-translation';
import { pricing, privacy, terms } from '@/routes';

const currentYear = new Date().getFullYear();

/** Support address shown publicly so visitors can identify and reach us. */
export const SUPPORT_EMAIL = 'support@uponco.com';

/**
 * Public marketing footer shared by the welcome, pricing and legal pages. The
 * links sit in a single stacked column so the full labels always fit, however
 * narrow the page is. The Privacy Policy link is spelled out in full because it
 * doubles as the policy link declared on our Google OAuth consent screen.
 *
 * `maxWidth` lines the footer up with the container of the page it sits under —
 * the legal documents are narrower than the marketing pages.
 */
export function SiteFooter({ maxWidth = 'max-w-6xl' }: { maxWidth?: string }) {
    const { t } = useTranslation('welcome');

    const links = [
        { href: pricing(), label: t('footer.pricing') },
        { href: privacy(), label: t('footer.privacy') },
        { href: terms(), label: t('footer.terms') },
    ];

    return (
        <footer className="border-t border-border/60">
            <div className={`mx-auto w-full ${maxWidth} px-6 py-14 sm:py-16`}>
                <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-16">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2.5 text-lg font-semibold">
                            <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-5 fill-current text-white" />
                            </span>
                            Uponco
                        </div>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            {t('footer.tagline')}
                        </p>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="mt-4 inline-block text-base font-medium text-primary hover:underline"
                        >
                            {SUPPORT_EMAIL}
                        </a>
                    </div>

                    <nav className="sm:min-w-48">
                        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                            {t('footer.linksHeading')}
                        </p>
                        <ul className="mt-4 flex flex-col gap-3">
                            {links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-base text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={`mailto:${SUPPORT_EMAIL}`}
                                    className="text-base text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {t('footer.contact')}
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>

                <p className="mt-12 border-t border-border/60 pt-8 text-sm text-muted-foreground">
                    © {currentYear} {t('footer.copyright')}
                </p>
            </div>
        </footer>
    );
}

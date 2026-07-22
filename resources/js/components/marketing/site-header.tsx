import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, home, login, pricing, register } from '@/routes';

/**
 * Public marketing header shared by the welcome, pricing and legal pages so
 * every page a logged-out visitor (or a Google reviewer) can reach carries the
 * same brand mark and the same navigation.
 */
export function SiteHeader() {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 font-semibold"
                >
                    <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </span>
                    <span className="hidden sm:inline">Uponco</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    <Link
                        href={pricing()}
                        className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4"
                    >
                        {t('nav.pricing')}
                    </Link>
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
                            {/* Mobile: single primary sign-in button */}
                            <Link
                                href={login()}
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:hidden"
                            >
                                {t('nav.signIn')}
                            </Link>
                            {/* Desktop: sign-in + get started */}
                            <Link
                                href={login()}
                                className="hidden items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                            >
                                {t('nav.signIn')}
                            </Link>
                            <Link
                                href={register()}
                                onClick={() =>
                                    captureEvent('get_started_clicked', {
                                        placement: 'nav',
                                    })
                                }
                                className="hidden items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
                            >
                                {t('nav.getStarted')}
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

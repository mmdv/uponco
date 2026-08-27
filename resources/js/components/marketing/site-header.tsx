import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Menu } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, features, home, login, pricing, register } from '@/routes';

/**
 * Public marketing header shared by the welcome, pricing and legal pages so
 * every page a logged-out visitor (or a Google reviewer) can reach carries the
 * same brand mark and the same navigation.
 *
 * Desktop shows the full nav inline; mobile collapses everything except the
 * logo and theme toggle into a hamburger-triggered drawer.
 */
export function SiteHeader() {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard() : '/';
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { href: home(), label: t('nav.home') },
        { href: features(), label: t('nav.features') },
        { href: pricing(), label: t('nav.pricing') },
    ];

    // On desktop the header carries no background of its own so the page
    // backdrop (the blooms) runs behind it, and the blur alone keeps the links
    // readable once content scrolls underneath. Phones don't render the blooms,
    // so a sticky backdrop-blur there would re-rasterise the blurred strip on
    // every scroll frame — the main cause of janky mobile scrolling — for no
    // visual gain. Below md we use a solid background instead and only turn the
    // blur on from md up.
    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background md:bg-transparent md:backdrop-blur">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                <Link href={home()} className="flex items-center">
                    <img
                        src="/icons/horizontal-logo.svg"
                        alt="Uponco"
                        className="h-6 w-auto"
                    />
                </Link>

                {/* Desktop navigation */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href.url}
                            href={link.href}
                            className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop actions */}
                <div className="hidden items-center gap-2 md:flex">
                    <ThemeSwitcher />
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
                                onClick={() =>
                                    captureEvent('get_started_clicked', {
                                        placement: 'nav',
                                    })
                                }
                                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                {t('nav.getStarted')}
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile bar: theme toggle + hamburger only */}
                <div className="flex items-center gap-1 md:hidden">
                    <ThemeSwitcher />
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 cursor-pointer"
                            >
                                <Menu className="size-5!" />
                                <span className="sr-only">{t('nav.menu')}</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[calc(100vw-1rem)] gap-0 p-0 sm:max-w-sm"
                        >
                            {/* Square logo top-left; the sheet's own close
                                button sits top-right. */}
                            <div className="flex h-16 items-center border-b border-border px-4">
                                <SheetClose asChild>
                                    <Link
                                        href={home()}
                                        className="flex size-10 items-center justify-center rounded-xl bg-primary"
                                    >
                                        <AppLogoIcon className="size-5 fill-current text-white" />
                                    </Link>
                                </SheetClose>
                                <SheetTitle className="sr-only">
                                    {t('nav.menu')}
                                </SheetTitle>
                            </div>

                            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
                                {/* Full-width primary action */}
                                {auth.user ? (
                                    <SheetClose asChild>
                                        <Link
                                            href={dashboardUrl}
                                            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                        >
                                            {t('nav.dashboard')}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </SheetClose>
                                ) : (
                                    <SheetClose asChild>
                                        <Link
                                            href={login()}
                                            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                        >
                                            {t('nav.signIn')}
                                        </Link>
                                    </SheetClose>
                                )}

                                {/* Menu items */}
                                <nav className="flex flex-col">
                                    {navLinks.map((link) => (
                                        <SheetClose asChild key={link.href.url}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                                            >
                                                {link.label}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>

                                {!auth.user && (
                                    <SheetClose asChild>
                                        <Link
                                            href={register()}
                                            onClick={() =>
                                                captureEvent(
                                                    'get_started_clicked',
                                                    { placement: 'nav_mobile' },
                                                )
                                            }
                                            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md border border-border text-sm font-medium transition-colors hover:bg-secondary"
                                        >
                                            {t('nav.getStarted')}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </SheetClose>
                                )}
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-border p-4">
                                <LanguageSwitcher />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}

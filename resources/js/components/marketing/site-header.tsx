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
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { dashboard, features, home, login, pricing, register } from '@/routes';

/**
 * Public marketing header shared by the welcome, pricing and legal pages so
 * every page a logged-out visitor (or a Google reviewer) can reach carries the
 * same brand mark and the same navigation.
 *
 * Desktop shows the full nav inline, centred; mobile collapses it into a
 * hamburger-triggered drawer, leaving only the logo, the theme toggle and the
 * menu trigger in the bar. Both surfaces mark the current page by colouring
 * that link with the primary colour.
 */
export function SiteHeader({
    transparent = false,
    maxWidth = 'max-w-6xl',
}: {
    transparent?: boolean;
    maxWidth?: string;
}) {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard() : '/';
    const [menuOpen, setMenuOpen] = useState(false);
    const { isCurrentUrl } = useCurrentUrl();

    const navLinks = [
        { href: home(), label: t('nav.home') },
        { href: features(), label: t('nav.features') },
        { href: pricing(), label: t('nav.pricing') },
    ];

    // The transparent variant (welcome hero) uses a top-to-bottom gradient
    // scrim instead of a backdrop-blur: a sticky blurred strip re-rasterises on
    // every scroll frame — janky on phones — so the gradient keeps the links
    // readable over the hero art with zero per-frame cost. The default variant
    // still uses a solid background below md and blur from md up.
    return (
        <header
            className={
                transparent
                    ? 'sticky top-0 z-50 bg-gradient-to-b from-background via-background/70 to-transparent'
                    : 'sticky top-0 z-50 border-b border-border/60 bg-background md:bg-transparent md:backdrop-blur'
            }
        >
            {/* Below md this is a plain flex row. From md up it becomes a
                three-column grid with equal 1fr rails either side of an auto
                centre column, so the nav links sit on the true centre line of
                the header no matter how wide the actions cluster grows (a
                "Dashboard" pill for signed-in visitors is far wider than
                "Sign in / Get started"). justify-between could never do that. */}
            <nav
                className={`mx-auto flex h-20 w-full ${maxWidth} items-center justify-between px-6 md:grid md:grid-cols-[1fr_auto_1fr]`}
            >
                <Link
                    href={home()}
                    className="flex items-center md:justify-self-start"
                >
                    <img
                        src="/icons/horizontal-logo.svg"
                        alt="Uponco"
                        className="h-6 w-auto"
                    />
                </Link>

                {/* Desktop navigation. Plain links; the current page is marked
                    with the primary colour and nothing else. */}
                <div className="hidden items-center gap-1 md:flex md:justify-self-center">
                    {navLinks.map((link) => {
                        const isActive = isCurrentUrl(link.href);

                        return (
                            <Link
                                key={link.href.url}
                                href={link.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'inline-flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-foreground',
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop actions */}
                <div className="hidden items-center gap-2 md:flex md:justify-self-end">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                    {auth.user ? (
                        <Link
                            href={dashboardUrl}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            {t('nav.dashboard')}
                            <ArrowRight className="size-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="inline-flex items-center rounded-md px-4 py-2 text-base font-medium text-foreground transition-colors hover:text-foreground"
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
                                className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                {t('nav.getStarted')}
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile bar: theme toggle + hamburger. The two used to be
                    identical ghost icon buttons, which read as a pair doing the
                    same kind of thing. The theme toggle stays a bare ghost icon
                    (a setting you flip in place); the menu becomes a filled,
                    bordered pill carrying its own label (a control that opens
                    something), so purpose is legible before the icon is. */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeSwitcher />
                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-9 cursor-pointer gap-1.5 rounded-lg border border-border bg-secondary/70 px-3 text-sm font-medium hover:bg-secondary"
                            >
                                <Menu className="size-4!" />
                                {t('nav.menu')}
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
                                    {navLinks.map((link) => {
                                        const isActive = isCurrentUrl(
                                            link.href,
                                        );

                                        return (
                                            <SheetClose
                                                asChild
                                                key={link.href.url}
                                            >
                                                <Link
                                                    href={link.href}
                                                    aria-current={
                                                        isActive
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'flex items-center rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-secondary',
                                                        isActive
                                                            ? 'text-primary'
                                                            : 'text-foreground',
                                                    )}
                                                >
                                                    {link.label}
                                                </Link>
                                            </SheetClose>
                                        );
                                    })}
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

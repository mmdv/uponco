import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarDays,
    LayoutGrid,
    UserCog,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import TeamSwitcherModal from '@/components/team-switcher-modal';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { isTeamManager } from '@/lib/teams';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as appointments } from '@/routes/appointments';
import { index as company } from '@/routes/company';
import { index as customers } from '@/routes/customers';
import { edit as profile } from '@/routes/profile';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const rightNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

const activeItemStyles =
    'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/15 dark:text-primary';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, currentTeam } = page.props;
    const getInitials = useInitials();
    const { whenCurrentUrl } = useCurrentUrl();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const [teamSwitcherOpen, setTeamSwitcherOpen] = useState(false);

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(currentTeam
            ? [
                  {
                      title: 'Appointments',
                      href: appointments(currentTeam.slug),
                      icon: CalendarDays,
                  },
                  {
                      title: 'Customers',
                      href: customers(currentTeam.slug),
                      icon: Users,
                  },
                  isTeamManager(currentTeam.role)
                      ? {
                            title: 'Company',
                            href: company(currentTeam.slug),
                            icon: Building2,
                        }
                      : {
                            title: 'Profile',
                            href: profile(),
                            icon: UserCog,
                        },
              ]
            : []),
    ];

    return (
        <>
            <div className="safe-area-inset-top safe-area-inset-left safe-area-inset-right border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <Link
                        href={dashboardUrl}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-10 cursor-pointer rounded-full px-4',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <LanguageSwitcher />
                            <ThemeSwitcher />
                            <div className="ml-1 hidden gap-1 lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent
                                    user={auth.user}
                                    onOpenTeams={() =>
                                        setTeamSwitcherOpen(true)
                                    }
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <TeamSwitcherModal
                open={teamSwitcherOpen}
                onOpenChange={setTeamSwitcherOpen}
            />
            {breadcrumbs.length > 1 && (
                <div className="flex w-full pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}

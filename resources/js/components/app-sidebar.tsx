import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarClock,
    CalendarRange,
    FolderGit2,
    LayoutGrid,
    SlidersHorizontal,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { isTeamManager } from '@/lib/teams';
import { dashboard } from '@/routes';
import { index as company } from '@/routes/company';
import { index as schedule, my as mySchedule } from '@/routes/schedule';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam ? dashboard() : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(page.props.currentTeam
            ? [
                  isTeamManager(page.props.currentTeam.role)
                      ? {
                            title: 'Manage',
                            href: company(),
                            icon: SlidersHorizontal,
                        }
                      : {
                            title: 'Schedule',
                            href: schedule(),
                            icon: CalendarClock,
                        },
                  {
                      title: 'My Schedule',
                      href: mySchedule(),
                      icon: CalendarRange,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

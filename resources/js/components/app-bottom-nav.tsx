import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    CalendarClock,
    CalendarDays,
    LayoutGrid,
    UserCog,
    Users,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { isTeamManager } from '@/lib/teams';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as appointments } from '@/routes/appointments';
import { index as company } from '@/routes/company';
import { edit as workProfile } from '@/routes/company/work-profile';
import { index as customers } from '@/routes/customers';
import { index as schedule } from '@/routes/schedule';
import type { NavItem } from '@/types';

export function AppBottomNav() {
    const { currentTeam } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    if (!currentTeam) {
        return null;
    }

    const dashboardUrl = dashboard(currentTeam.slug);

    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Appointments',
            href: appointments(currentTeam.slug),
            icon: CalendarDays,
        },
        {
            title: 'Schedule',
            href: schedule(currentTeam.slug),
            icon: CalendarClock,
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
                  href: workProfile(currentTeam.slug),
                  icon: UserCog,
              },
    ];

    return (
        <nav className="safe-area-inset-bottom safe-area-inset-left safe-area-inset-right fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border/80 bg-background lg:hidden">
            <div className="flex h-16 items-stretch justify-around">
                {items.map((item) => {
                    const active =
                        item.title === 'Dashboard'
                            ? isCurrentUrl(item.href)
                            : isCurrentOrParentUrl(item.href);

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                active
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {item.icon && (
                                <item.icon
                                    className={cn(
                                        'h-5 w-5',
                                        active && 'text-primary',
                                    )}
                                />
                            )}
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

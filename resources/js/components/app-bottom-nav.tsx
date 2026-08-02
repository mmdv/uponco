import { Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    CalendarDays,
    LayoutGrid,
    SlidersVertical,
    Users,
} from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { isTeamManager } from '@/lib/teams';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as appointments } from '@/routes/appointments';
import { index as company } from '@/routes/company';
import { index as customers } from '@/routes/customers';
import { index as schedule } from '@/routes/schedule';
import type { NavItem } from '@/types';

export function AppBottomNav() {
    const { t } = useTranslation('nav');
    const { currentTeam } = usePage().props;
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    if (!currentTeam) {
        return null;
    }

    const dashboardUrl = dashboard();

    const items: (NavItem & { isDashboard?: boolean })[] = [
        {
            title: t('main.dashboard'),
            href: dashboardUrl,
            icon: LayoutGrid,
            isDashboard: true,
        },
        {
            title: t('main.appointments'),
            href: appointments(),
            icon: CalendarDays,
        },
        {
            title: t('main.customers'),
            href: customers(),
            icon: Users,
        },
        isTeamManager(currentTeam.role)
            ? {
                  title: t('main.company'),
                  href: company(),
                  icon: SlidersVertical,
              }
            : {
                  title: t('main.schedule'),
                  href: schedule(),
                  icon: CalendarClock,
              },
    ];

    return (
        <nav className="safe-area-inset-bottom safe-area-inset-left safe-area-inset-right fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border/80 bg-background lg:hidden">
            <div className="flex h-16 items-stretch justify-around">
                {items.map((item) => {
                    const active = item.isDashboard
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

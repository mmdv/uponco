import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn, toUrl } from '@/lib/utils';
import { edit as editBusiness } from '@/routes/company/business';
import { index as businessMembers } from '@/routes/company/business/members';
import type { NavItem } from '@/types';

export default function BusinessLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation('company');
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const sidebarNavItems: NavItem[] = [
        {
            title: t('business.nav.general'),
            href: editBusiness(teamSlug),
            icon: null,
        },
        {
            title: t('business.nav.teamMembers'),
            href: businessMembers(teamSlug),
            icon: null,
        },
    ];

    return (
        <div className="px-4 py-6">
            <Heading
                title={t('business.title')}
                description={t('business.description')}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full lg:w-48">
                    <nav
                        className="-mx-1 flex flex-row gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
                        aria-label={t('business.title')}
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'shrink-0 justify-center lg:w-full lg:justify-start',
                                    {
                                        'bg-muted': isCurrentOrParentUrl(
                                            item.href,
                                        ),
                                    },
                                )}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

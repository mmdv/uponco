import { Bell, Plug, ShieldCheck, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { SectionNavLayout } from '@/components/section-nav';
import type { SectionNavItem } from '@/components/section-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { edit as editIntegrations } from '@/routes/integrations';
import { edit as editNotifications } from '@/routes/notifications';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation('settings');
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const sectionNavItems: SectionNavItem[] = [
        {
            key: 'profile',
            title: t('nav.profile'),
            href: editProfile(),
            icon: User,
            isActive: isCurrentOrParentUrl(editProfile()),
        },
        {
            key: 'security',
            title: t('nav.security'),
            href: editSecurity(),
            icon: ShieldCheck,
            isActive: isCurrentOrParentUrl(editSecurity()),
        },
        {
            key: 'notifications',
            title: t('nav.notifications'),
            href: editNotifications(),
            icon: Bell,
            isActive: isCurrentOrParentUrl(editNotifications()),
        },
        {
            key: 'integrations',
            title: t('nav.integrations'),
            href: editIntegrations(),
            icon: Plug,
            isActive: isCurrentOrParentUrl(editIntegrations()),
        },
    ];

    return (
        <SectionNavLayout
            title={t('title')}
            description={t('description')}
            items={sectionNavItems}
            navLabel={t('title')}
            contentClassName="md:max-w-2xl"
        >
            <section className="max-w-xl space-y-12">{children}</section>
        </SectionNavLayout>
    );
}

import { Building2, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { SectionNavLayout } from '@/components/section-nav';
import type { SectionNavItem } from '@/components/section-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { edit as editBusiness } from '@/routes/company/business';
import { index as businessMembers } from '@/routes/company/business/members';

export default function BusinessLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation('company');
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const sectionNavItems: SectionNavItem[] = [
        {
            key: 'general',
            title: t('business.nav.general'),
            href: editBusiness(),
            icon: Building2,
            isActive: isCurrentOrParentUrl(editBusiness()),
        },
        {
            key: 'members',
            title: t('business.nav.teamMembers'),
            href: businessMembers(),
            icon: Users,
            isActive: isCurrentOrParentUrl(businessMembers()),
        },
    ];

    return (
        <SectionNavLayout
            title={t('business.title')}
            description={t('business.description')}
            items={sectionNavItems}
            navLabel={t('business.title')}
            contentClassName="md:max-w-2xl"
        >
            <section className="max-w-xl space-y-12">{children}</section>
        </SectionNavLayout>
    );
}

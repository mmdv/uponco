import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    MapPin,
    ShieldCheck,
    Sparkles,
    User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import {
    LocationsSection,
    ScheduleSection,
    ServicesSection,
} from '@/components/company/members/member-assignment-sections';
import {
    AccessSection,
    ProfileSection,
} from '@/components/company/members/member-edit-sections';
import type {
    MemberAccount,
    MemberLocation,
    MemberProfile,
    MemberService,
    SectionArg,
} from '@/components/company/members/member-edit-types';
import { SectionNavLayout } from '@/components/section-nav';
import type { SectionNavItem } from '@/components/section-nav';
import { useTranslation } from '@/hooks/use-translation';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import { index as businessMembers } from '@/routes/company/business/members';
import type { RoleOption } from '@/types';
import type { DayScheduleMap, MemberScheduleMember } from '@/types/schedule';

type Props = {
    member: MemberAccount;
    profile: MemberProfile;
    availableRoles: RoleOption[];
    locations: MemberLocation[];
    assignedLocationIds: number[];
    services: MemberService[];
    assignedServiceIds: number[];
    schedule?: DayScheduleMap;
    scheduleMembers?: MemberScheduleMember[];
};

type SectionKey = 'profile' | 'access' | 'locations' | 'services' | 'schedule';

/**
 * The section named in the URL, so links into a particular tab — such as the
 * schedule picker hopping between members — land where they meant to.
 */
function sectionFromUrl(): SectionKey {
    const requested = new URLSearchParams(window.location.search).get(
        'section',
    );

    return requested === 'profile' ||
        requested === 'access' ||
        requested === 'locations' ||
        requested === 'services' ||
        requested === 'schedule'
        ? requested
        : 'profile';
}

export default function EditMember({
    member,
    profile,
    availableRoles,
    locations,
    assignedLocationIds,
    services,
    assignedServiceIds,
    schedule,
    scheduleMembers,
}: Props) {
    const { t } = useTranslation('company');
    const [section, setSection] = useState<SectionKey>(sectionFromUrl);
    const memberArg: SectionArg = [member.id];

    const sectionDefinitions: {
        key: SectionKey;
        title: string;
        icon: LucideIcon;
    }[] = [
        {
            key: 'profile',
            title: t('business.memberEdit.sections.profile'),
            icon: User,
        },
        {
            key: 'access',
            title: t('business.memberEdit.sections.access'),
            icon: ShieldCheck,
        },
        {
            key: 'locations',
            title: t('business.memberEdit.sections.locations'),
            icon: MapPin,
        },
        {
            key: 'services',
            title: t('business.memberEdit.sections.services'),
            icon: Sparkles,
        },
        {
            key: 'schedule',
            title: t('business.memberEdit.sections.schedule'),
            icon: CalendarDays,
        },
    ];

    const sectionNavItems: SectionNavItem[] = sectionDefinitions.map(
        (definition) => ({
            key: definition.key,
            title: definition.title,
            icon: definition.icon,
            isActive: section === definition.key,
            onSelect: () => setSection(definition.key),
            testId: `member-section-${definition.key}`,
        }),
    );

    return (
        <>
            <Head title={member.name} />

            {/* The seven-column week grid needs the full width; the form
                sections stay narrow so their fields don't stretch. */}
            <SectionNavLayout
                title={member.name}
                description={t('business.memberEdit.description')}
                items={sectionNavItems}
                navLabel={t('business.memberEdit.sectionsNav')}
                contentClassName={
                    section === 'schedule' ? undefined : 'md:max-w-2xl'
                }
            >
                <section
                    className={section === 'schedule' ? 'min-w-0' : 'max-w-xl'}
                >
                    {section === 'profile' ? (
                        <ProfileSection
                            member={member}
                            profile={profile}
                            arg={memberArg}
                        />
                    ) : null}
                    {section === 'access' ? (
                        <AccessSection
                            member={member}
                            availableRoles={availableRoles}
                            arg={memberArg}
                        />
                    ) : null}
                    {section === 'locations' ? (
                        <LocationsSection
                            locations={locations}
                            assignedLocationIds={assignedLocationIds}
                            arg={memberArg}
                        />
                    ) : null}
                    {section === 'services' ? (
                        <ServicesSection
                            services={services}
                            assignedServiceIds={assignedServiceIds}
                            arg={memberArg}
                        />
                    ) : null}
                    {section === 'schedule' ? (
                        <ScheduleSection
                            member={member}
                            schedule={schedule}
                            scheduleMembers={scheduleMembers}
                        />
                    ) : null}
                </section>
            </SectionNavLayout>
        </>
    );
}

EditMember.layout = (props: {
    currentTeam?: { slug: string } | null;
    member?: { name: string };
}) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: companyIndex(),
        },
        {
            title: 'Business',
            href: editBusiness(),
        },
        {
            title: 'Team Members',
            href: businessMembers(),
        },
        {
            title: props.member?.name ?? 'Member',
            href: '#',
        },
    ],
});

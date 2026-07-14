import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import {
    destroyAvatar,
    updateAccount,
    updateAvatar,
    updateLocations,
    updateProfile,
    updateServices,
    update as updateRole,
} from '@/actions/App/Http/Controllers/Company/BusinessMemberController';
import AvatarUploader from '@/components/avatar-uploader';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import type { CheckboxCardOption } from '@/components/ui/checkbox-card-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import { index as businessMembers } from '@/routes/company/business/members';
import type { RoleOption } from '@/types';

type MemberAccount = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    role_label: string | null;
};

type MemberProfile = {
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    description: string | null;
};

type MemberLocation = { id: number; name: string; city: string | null };
type MemberService = { id: number; title: string; category: string | null };

type Props = {
    member: MemberAccount;
    profile: MemberProfile;
    availableRoles: RoleOption[];
    locations: MemberLocation[];
    assignedLocationIds: number[];
    services: MemberService[];
    assignedServiceIds: number[];
};

type SectionKey = 'account' | 'profile' | 'access' | 'locations' | 'services';

export default function EditMember({
    member,
    profile,
    availableRoles,
    locations,
    assignedLocationIds,
    services,
    assignedServiceIds,
}: Props) {
    const { t } = useTranslation('company');
    const [section, setSection] = useState<SectionKey>('account');
    const { currentTeam } = usePage().props;
    const memberArg: SectionArg = [currentTeam?.slug ?? '', member.id];

    const sections: { key: SectionKey; title: string }[] = [
        { key: 'account', title: t('business.memberEdit.sections.account') },
        { key: 'profile', title: t('business.memberEdit.sections.profile') },
        { key: 'access', title: t('business.memberEdit.sections.access') },
        {
            key: 'locations',
            title: t('business.memberEdit.sections.locations'),
        },
        {
            key: 'services',
            title: t('business.memberEdit.sections.services'),
        },
    ];

    return (
        <div className="px-4 py-6">
            <Head title={member.name} />

            <Heading
                title={member.name}
                description={t('business.memberEdit.description')}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full lg:w-48">
                    <nav
                        className="-mx-1 flex flex-row gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
                        aria-label={t('business.memberEdit.sectionsNav')}
                    >
                        {sections.map((item) => (
                            <Button
                                key={item.key}
                                size="sm"
                                variant="ghost"
                                data-test={`member-section-${item.key}`}
                                onClick={() => setSection(item.key)}
                                className={cn(
                                    'shrink-0 justify-center lg:w-full lg:justify-start',
                                    {
                                        'bg-muted': section === item.key,
                                    },
                                )}
                            >
                                {item.title}
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl">
                        {section === 'account' ? (
                            <AccountSection member={member} arg={memberArg} />
                        ) : null}
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
                    </section>
                </div>
            </div>
        </div>
    );
}

type SectionArg = [string, number];

function AccountSection({
    member,
    arg,
}: {
    member: MemberAccount;
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.account.title')}
                description={t('business.memberEdit.account.description')}
            />

            <Form
                {...updateAccount.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {t('business.memberEdit.account.name')}
                            </Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                defaultValue={member.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder={t(
                                    'business.memberEdit.account.name',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {t('business.memberEdit.account.email')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                defaultValue={member.email}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder={t(
                                    'business.memberEdit.account.email',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-account-button"
                            >
                                {t('business.memberEdit.account.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function ProfileSection({
    member,
    profile,
    arg,
}: {
    member: MemberAccount;
    profile: MemberProfile;
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.profile.pictureTitle')}
                description={t(
                    'business.memberEdit.profile.pictureDescription',
                )}
            />

            <AvatarUploader
                user={member}
                uploadUrl={updateAvatar.url(arg)}
                removeUrl={destroyAvatar.url(arg)}
            />

            <Heading
                variant="small"
                title={t('business.memberEdit.profile.title')}
                description={t('business.memberEdit.profile.description')}
            />

            <Form
                {...updateProfile.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="profile_name">
                                {t('business.memberEdit.profile.name')}
                            </Label>
                            <Input
                                id="profile_name"
                                className="mt-1 block w-full"
                                defaultValue={profile.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder={t(
                                    'business.memberEdit.profile.namePlaceholder',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile_email">
                                {t('business.memberEdit.profile.publicEmail')}
                            </Label>
                            <Input
                                id="profile_email"
                                type="email"
                                className="mt-1 block w-full"
                                defaultValue={profile.email ?? ''}
                                name="email"
                                placeholder={t(
                                    'business.memberEdit.profile.publicEmailPlaceholder',
                                )}
                            />
                            <p className="text-sm text-muted-foreground">
                                {t(
                                    'business.memberEdit.profile.publicEmailHint',
                                )}
                            </p>
                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">
                                {t('business.memberEdit.profile.phone')}
                            </Label>
                            <PhoneInput
                                id="phone"
                                name="phone"
                                defaultValue={profile.phone ?? ''}
                                placeholder={t(
                                    'business.memberEdit.profile.phonePlaceholder',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.phone}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="job_title">
                                {t('business.memberEdit.profile.jobTitle')}
                            </Label>
                            <Input
                                id="job_title"
                                className="mt-1 block w-full"
                                defaultValue={profile.job_title ?? ''}
                                name="job_title"
                                placeholder={t(
                                    'business.memberEdit.profile.jobTitlePlaceholder',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.job_title}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                {t(
                                    'business.memberEdit.profile.descriptionLabel',
                                )}
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={profile.description ?? ''}
                                placeholder={t(
                                    'business.memberEdit.profile.descriptionPlaceholder',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={errors.description}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-profile-button"
                            >
                                {t('business.memberEdit.profile.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function AccessSection({
    member,
    availableRoles,
    arg,
}: {
    member: MemberAccount;
    availableRoles: RoleOption[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [role, setRole] = useState(
        member.role ?? availableRoles[0]?.value ?? '',
    );

    if (member.role === 'owner') {
        return (
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('business.memberEdit.access.title')}
                    description={t('business.memberEdit.access.description')}
                />
                <p className="text-sm text-muted-foreground">
                    {t('business.memberEdit.access.ownerNotice')}{' '}
                    <Badge variant="secondary">{member.role_label}</Badge>{' '}
                    {t('business.memberEdit.access.ownerCannotChange')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.access.title')}
                description={t('business.memberEdit.access.description')}
            />

            <Form
                {...updateRole.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        <input type="hidden" name="role" value={role} />

                        <div className="grid gap-2">
                            <Label>
                                {t('business.memberEdit.access.role')}
                            </Label>
                            <ToggleGroup
                                type="single"
                                value={role}
                                onValueChange={(next) => {
                                    if (next) {
                                        setRole(next);
                                    }
                                }}
                                variant="outline"
                                className="w-full"
                                data-test="member-role-toggle"
                            >
                                {availableRoles.map((option) => (
                                    <ToggleGroupItem
                                        key={option.value}
                                        value={option.value}
                                        className="h-9 flex-1 px-3"
                                    >
                                        {option.label}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-role-button"
                            >
                                {t('business.memberEdit.access.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function LocationsSection({
    locations,
    assignedLocationIds,
    arg,
}: {
    locations: MemberLocation[];
    assignedLocationIds: number[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [selected, setSelected] = useState<string[]>(
        assignedLocationIds.map((id) => id.toString()),
    );

    const options: CheckboxCardOption[] = locations.map((location) => ({
        value: location.id.toString(),
        label: location.name,
        description: location.city,
    }));

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.locations.title')}
                description={t('business.memberEdit.locations.description')}
            />

            <Form
                {...updateLocations.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        {selected.map((id) => (
                            <input
                                key={`location-${id}`}
                                type="hidden"
                                name="ids[]"
                                value={id}
                            />
                        ))}

                        <CheckboxCardGroup
                            options={options}
                            value={selected}
                            onChange={setSelected}
                            emptyMessage={t(
                                'business.memberEdit.locations.empty',
                            )}
                            data-test="member-locations"
                        />

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-locations-button"
                            >
                                {t('business.memberEdit.locations.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

function ServicesSection({
    services,
    assignedServiceIds,
    arg,
}: {
    services: MemberService[];
    assignedServiceIds: number[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [selected, setSelected] = useState<string[]>(
        assignedServiceIds.map((id) => id.toString()),
    );

    const options: CheckboxCardOption[] = services.map((service) => ({
        value: service.id.toString(),
        label: service.title,
        description: service.category,
    }));

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.services.title')}
                description={t('business.memberEdit.services.description')}
            />

            <Form
                {...updateServices.form(arg)}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing }) => (
                    <>
                        {selected.map((id) => (
                            <input
                                key={`service-${id}`}
                                type="hidden"
                                name="ids[]"
                                value={id}
                            />
                        ))}

                        <CheckboxCardGroup
                            options={options}
                            value={selected}
                            onChange={setSelected}
                            emptyMessage={t(
                                'business.memberEdit.services.empty',
                            )}
                            data-test="member-services"
                        />

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-member-services-button"
                            >
                                {t('business.memberEdit.services.save')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );
}

EditMember.layout = (props: {
    currentTeam?: { slug: string } | null;
    member?: { name: string };
}) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Business',
            href: props.currentTeam
                ? editBusiness(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Team Members',
            href: props.currentTeam
                ? businessMembers(props.currentTeam.slug)
                : '/',
        },
        {
            title: props.member?.name ?? 'Member',
            href: '#',
        },
    ],
});

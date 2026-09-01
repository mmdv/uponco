import { Form } from '@inertiajs/react';
import { useState } from 'react';

import {
    destroyAvatar,
    updateAccount,
    updateAvatar,
    updateProfile,
    update as updateRole,
} from '@/actions/App/Http/Controllers/Company/BusinessMemberController';
import AvatarUploader from '@/components/avatar-uploader';
import type {
    MemberAccount,
    MemberProfile,
    SectionArg,
} from '@/components/company/members/member-edit-types';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useClientValidation } from '@/hooks/use-client-validation';
import { useTranslation } from '@/hooks/use-translation';
import { email as isEmail, firstErrors, required } from '@/lib/validation';
import type { RoleOption } from '@/types';

export function ProfileSection({
    member,
    profile,
    arg,
}: {
    member: MemberAccount;
    profile: MemberProfile;
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const { t: tError } = useTranslation('errors');

    // Mirrors UpdateBusinessMemberProfileRequest: name is required, and a public
    // email is optional but must look like one when given.
    const validation = useClientValidation('member-profile-form', (data) =>
        firstErrors([
            {
                field: 'name',
                passes: required(data.name),
                message: tError('validation.required'),
            },
            {
                field: 'email',
                passes: !required(data.email) || isEmail(data.email),
                message: tError('validation.email'),
            },
        ]),
    );

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
                id="member-profile-form"
                options={{ preserveScroll: true }}
                onChange={validation.onChange}
                onBefore={validation.onBefore}
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
                                defaultValue={member.name}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder={t(
                                    'business.memberEdit.profile.namePlaceholder',
                                )}
                            />
                            <InputError
                                className="mt-2"
                                message={validation.error('name', errors.name)}
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
                                message={validation.error(
                                    'email',
                                    errors.email,
                                )}
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

export function AccessSection({
    member,
    availableRoles,
    arg,
}: {
    member: MemberAccount;
    availableRoles: RoleOption[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const { t: tError } = useTranslation('errors');
    const [role, setRole] = useState(
        member.role ?? availableRoles[0]?.value ?? '',
    );

    // Mirrors UpdateBusinessMemberAccountRequest's email rules.
    const validation = useClientValidation('member-account-form', (data) =>
        firstErrors([
            {
                field: 'email',
                passes: required(data.email),
                message: tError('validation.required'),
            },
            {
                field: 'email',
                passes: isEmail(data.email),
                message: tError('validation.email'),
            },
        ]),
    );

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.access.title')}
                description={t('business.memberEdit.access.description')}
            />

            <Form
                {...updateAccount.form(arg)}
                id="member-account-form"
                options={{ preserveScroll: true }}
                onChange={validation.onChange}
                onBefore={validation.onBefore}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
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
                                message={validation.error(
                                    'email',
                                    errors.email,
                                )}
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

            <Separator />

            {member.role === 'owner' ? (
                <p className="text-sm text-muted-foreground">
                    {t('business.memberEdit.access.ownerNotice')}{' '}
                    <Badge variant="secondary">{member.role_label}</Badge>{' '}
                    {t('business.memberEdit.access.ownerCannotChange')}
                </p>
            ) : (
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
            )}
        </div>
    );
}

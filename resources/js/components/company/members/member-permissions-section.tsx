import { Form } from '@inertiajs/react';
import { useState } from 'react';

import { updatePermissions } from '@/actions/App/Http/Controllers/Company/BusinessMemberController';
import type {
    GrantablePermission,
    MemberAccount,
    SectionArg,
} from '@/components/company/members/member-edit-types';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import type { CheckboxCardOption } from '@/components/ui/checkbox-card-group';
import { useTranslation } from '@/hooks/use-translation';

/**
 * Maps each grantable permission value to the translation slug that holds its
 * label and description. Adding a permission means adding a row here plus the
 * matching keys under `business.memberEdit.permissions.items`.
 */
const PERMISSION_SLUGS: Record<string, string> = {
    'appointment:view-all': 'appointments',
};

export function PermissionsSection({
    member,
    grantablePermissions,
    arg,
}: {
    member: MemberAccount;
    grantablePermissions: GrantablePermission[];
    arg: SectionArg;
}) {
    const { t } = useTranslation('company');
    const [selected, setSelected] = useState<string[]>(member.permissions);

    // Owners and admins already have every grantable permission through their
    // role, so the toggles would be meaningless — show a read-only notice.
    const roleGrantsAll = member.role === 'owner' || member.role === 'admin';

    const options: CheckboxCardOption[] = grantablePermissions.map(
        (permission) => {
            const slug = PERMISSION_SLUGS[permission.value] ?? permission.value;

            return {
                value: permission.value,
                label: t(`business.memberEdit.permissions.items.${slug}.label`),
                description: t(
                    `business.memberEdit.permissions.items.${slug}.description`,
                ),
            };
        },
    );

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('business.memberEdit.permissions.title')}
                description={t('business.memberEdit.permissions.description')}
            />

            {roleGrantsAll ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-foreground">
                    {t('business.memberEdit.permissions.roleGrantedNotice')}{' '}
                    <Badge variant="secondary">{member.role_label}</Badge>
                </p>
            ) : (
                <Form
                    {...updatePermissions.form(arg)}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing }) => (
                        <>
                            {selected.map((permission) => (
                                <input
                                    key={`permission-${permission}`}
                                    type="hidden"
                                    name="permissions[]"
                                    value={permission}
                                />
                            ))}

                            <CheckboxCardGroup
                                options={options}
                                value={selected}
                                onChange={setSelected}
                                emptyMessage={t(
                                    'business.memberEdit.permissions.empty',
                                )}
                                data-test="member-permissions"
                            />

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-member-permissions-button"
                                >
                                    {t('business.memberEdit.permissions.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            )}
        </div>
    );
}

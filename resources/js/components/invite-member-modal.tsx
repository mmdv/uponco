import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { store as storeInvitation } from '@/routes/company/business/invitations';
import type { RoleOption, Team } from '@/types';

type Props = {
    team: Team;
    availableRoles: RoleOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function InviteMemberModal({
    team,
    availableRoles,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [inviteRole, setInviteRole] = useState<RoleOption['value']>('member');

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setInviteRole('member');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...storeInvitation.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('business.inviteMemberModal.title')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t(
                                        'business.inviteMemberModal.description',
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('business.inviteMemberModal.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        data-test="invite-email"
                                        placeholder={t(
                                            'business.inviteMemberModal.emailPlaceholder',
                                        )}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">
                                        {t('business.inviteMemberModal.role')}
                                    </Label>
                                    <Select
                                        name="role"
                                        data-test="invite-role"
                                        value={inviteRole}
                                        onValueChange={(value) =>
                                            setInviteRole(
                                                value as RoleOption['value'],
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={t(
                                                    'business.inviteMemberModal.rolePlaceholder',
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem
                                                    key={role.value}
                                                    value={role.value}
                                                >
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        {t('business.inviteMemberModal.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="invite-submit"
                                    disabled={processing}
                                >
                                    {t('business.inviteMemberModal.submit')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

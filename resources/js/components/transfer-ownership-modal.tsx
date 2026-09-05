import { Form, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
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
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { transfer } from '@/routes/company/business/owner';
import type { Auth, TeamMember } from '@/types';

type Props = {
    member: TeamMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function TransferOwnershipModal({
    member,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const { auth } = usePage<{ auth: Auth }>().props;
    const hasPassword = auth.hasPassword;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form
                    key={String(member?.id ?? open)}
                    {...transfer.form()}
                    className="space-y-6"
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('business.transferOwnership.modalTitle')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t(
                                        'business.transferOwnership.modalDescription',
                                        { name: member?.name ?? '' },
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="user_id"
                                value={member?.id ?? ''}
                            />

                            <div className="grid gap-2">
                                {hasPassword ? (
                                    <>
                                        <Label htmlFor="transfer-password">
                                            {t(
                                                'business.transferOwnership.passwordLabel',
                                            )}
                                        </Label>
                                        <PasswordInput
                                            id="transfer-password"
                                            name="password"
                                            data-test="transfer-ownership-password"
                                            autoComplete="current-password"
                                        />
                                        <InputError message={errors.password} />
                                    </>
                                ) : null}
                                <InputError message={errors.user_id} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        {t('business.transferOwnership.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="transfer-ownership-confirm"
                                    disabled={!member || processing}
                                >
                                    {t('business.transferOwnership.confirm')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

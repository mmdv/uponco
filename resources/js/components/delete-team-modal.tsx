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
import { useTranslation } from '@/hooks/use-translation';
import { destroy } from '@/routes/company/business';
import type { Team } from '@/types';

type Props = {
    team: Team;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteTeamModal({ team, open, onOpenChange }: Props) {
    const { t } = useTranslation('company');
    const [confirmationName, setConfirmationName] = useState('');

    const canDeleteTeam = confirmationName === team.name;

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setConfirmationName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...destroy.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => handleOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('business.deleteTeam.modalTitle')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('business.deleteTeam.modalDescription', {
                                        name: team.name,
                                    })}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmation-name">
                                        {t('business.deleteTeam.confirmLabel', {
                                            name: team.name,
                                        })}
                                    </Label>
                                    <Input
                                        id="confirmation-name"
                                        name="name"
                                        data-test="delete-team-name"
                                        value={confirmationName}
                                        onChange={(event) =>
                                            setConfirmationName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'business.deleteTeam.confirmPlaceholder',
                                        )}
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        {t('business.deleteTeam.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    type="submit"
                                    data-test="delete-team-confirm"
                                    disabled={!canDeleteTeam || processing}
                                >
                                    {t('business.deleteTeam.confirm')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

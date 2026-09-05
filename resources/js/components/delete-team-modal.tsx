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
import type { Team, TeamDeletionSummary } from '@/types';

type Props = {
    team: Team;
    deletionSummary: TeamDeletionSummary;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Order the preview list deliberately: people first, then the records tied to
// them. Keys line up with the `business.deleteTeam.summary.*` translations.
const SUMMARY_ROWS: (keyof TeamDeletionSummary)[] = [
    'members',
    'services',
    'serviceCategories',
    'customers',
    'appointments',
    'locations',
    'scheduleSlots',
    'invitations',
];

export default function DeleteTeamModal({
    team,
    deletionSummary,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('company');
    const [confirmationName, setConfirmationName] = useState('');

    const canDeleteTeam = confirmationName === team.name;

    const summaryRows = SUMMARY_ROWS.filter(
        (key) => deletionSummary[key] > 0,
    );

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
                    {...destroy.form()}
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
                                {summaryRows.length > 0 ? (
                                    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm dark:border-red-200/10 dark:bg-red-700/10">
                                        <p className="font-medium text-red-600 dark:text-red-100">
                                            {t(
                                                'business.deleteTeam.summary.title',
                                            )}
                                        </p>
                                        <ul className="mt-2 space-y-1 text-red-600/90 dark:text-red-100/90">
                                            {summaryRows.map((key) => (
                                                <li
                                                    key={key}
                                                    data-test={`delete-team-summary-${key}`}
                                                >
                                                    {t(
                                                        `business.deleteTeam.summary.${key}`,
                                                        {
                                                            count: deletionSummary[
                                                                key
                                                            ],
                                                        },
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

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

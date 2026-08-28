import { Form } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientValidation } from '@/hooks/use-client-validation';
import { useTranslation } from '@/hooks/use-translation';
import { firstErrors, required } from '@/lib/validation';
import { store } from '@/routes/teams';

export default function CreateTeamModal({ children }: PropsWithChildren) {
    const { t } = useTranslation('nav');
    const { t: tError } = useTranslation('errors');
    const [open, setOpen] = useState(false);

    // Mirrors SaveTeamRequest so an empty name never spends a request.
    const validation = useClientValidation('create-team-form', (data) =>
        firstErrors([
            {
                field: 'name',
                passes: required(data.name),
                message: tError('validation.required'),
            },
        ]),
    );

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            validation.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...store.form()}
                    id="create-team-form"
                    className="space-y-6"
                    onChange={validation.onChange}
                    onBefore={validation.onBefore}
                    onSuccess={() => setOpen(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('createTeamModal.title')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('createTeamModal.description')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('createTeamModal.teamName')}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    data-test="create-team-name"
                                    placeholder={t(
                                        'createTeamModal.teamNamePlaceholder',
                                    )}
                                    required
                                />
                                <InputError
                                    message={validation.error(
                                        'name',
                                        errors.name,
                                    )}
                                />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        {t('createTeamModal.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="create-team-submit"
                                    disabled={processing}
                                >
                                    {t('createTeamModal.submit')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

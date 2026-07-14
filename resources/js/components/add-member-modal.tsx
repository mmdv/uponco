import { Form } from '@inertiajs/react';
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
import { store as storeMember } from '@/routes/company/business/members';
import type { Team } from '@/types';

type Props = {
    team: Team;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function AddMemberModal({ team, open, onOpenChange }: Props) {
    const { t } = useTranslation('company');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...storeMember.form(team.slug)}
                    className="space-y-6"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('business.addMemberModal.title')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('business.addMemberModal.description')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            {t('business.addMemberModal.name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            data-test="member-name"
                                            placeholder={t(
                                                'business.addMemberModal.namePlaceholder',
                                            )}
                                            autoComplete="off"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="surname">
                                            {t(
                                                'business.addMemberModal.surname',
                                            )}
                                        </Label>
                                        <Input
                                            id="surname"
                                            name="surname"
                                            data-test="member-surname"
                                            placeholder={t(
                                                'business.addMemberModal.surnamePlaceholder',
                                            )}
                                            autoComplete="off"
                                        />
                                        <InputError message={errors.surname} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="job_title">
                                        {t('business.addMemberModal.jobTitle')}
                                    </Label>
                                    <Input
                                        id="job_title"
                                        name="job_title"
                                        data-test="member-title"
                                        placeholder={t(
                                            'business.addMemberModal.jobTitlePlaceholder',
                                        )}
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.job_title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('business.addMemberModal.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        data-test="member-email"
                                        placeholder={t(
                                            'business.addMemberModal.emailPlaceholder',
                                        )}
                                        autoComplete="off"
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('business.addMemberModal.password')}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        data-test="member-password"
                                        placeholder={t(
                                            'business.addMemberModal.passwordPlaceholder',
                                        )}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        {t('business.addMemberModal.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    data-test="member-submit"
                                    disabled={processing}
                                >
                                    {t('business.addMemberModal.submit')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

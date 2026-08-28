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
import { useClientValidation } from '@/hooks/use-client-validation';
import { useTranslation } from '@/hooks/use-translation';
import {
    email as isEmail,
    firstErrors,
    minLength,
    required,
} from '@/lib/validation';
import { store as storeMember } from '@/routes/company/business/members';

const MIN_PASSWORD_LENGTH = 8;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function AddMemberModal({ open, onOpenChange }: Props) {
    const { t } = useTranslation('company');
    const { t: tError } = useTranslation('errors');

    // Mirrors CreateBusinessMemberRequest so a submission already known to fail
    // never leaves the browser. Surname and job title are optional server-side.
    const validation = useClientValidation('add-member-form', (data) =>
        firstErrors([
            {
                field: 'name',
                passes: required(data.name),
                message: tError('validation.required'),
            },
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
            {
                field: 'password',
                passes: required(data.password),
                message: tError('validation.required'),
            },
            {
                field: 'password',
                passes: minLength(data.password, MIN_PASSWORD_LENGTH),
                message: tError('validation.passwordLength', {
                    min: MIN_PASSWORD_LENGTH,
                }),
            },
            {
                field: 'password_confirmation',
                passes: data.password === data.password_confirmation,
                message: tError('validation.passwordConfirmation'),
            },
        ]),
    );

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            validation.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    {...storeMember.form()}
                    id="add-member-form"
                    className="space-y-6"
                    onChange={validation.onChange}
                    onBefore={validation.onBefore}
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
                                        <InputError
                                            message={validation.error(
                                                'name',
                                                errors.name,
                                            )}
                                        />
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
                                    <InputError
                                        message={validation.error(
                                            'email',
                                            errors.email,
                                        )}
                                    />
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
                                    <InputError
                                        message={validation.error(
                                            'password',
                                            errors.password,
                                        )}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {t(
                                            'business.addMemberModal.passwordConfirmation',
                                        )}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        data-test="member-password-confirmation"
                                        placeholder={t(
                                            'business.addMemberModal.passwordConfirmationPlaceholder',
                                        )}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputError
                                        message={validation.error(
                                            'password_confirmation',
                                            errors.password_confirmation,
                                        )}
                                    />
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

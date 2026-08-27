import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useClientValidation } from '@/hooks/use-client-validation';
import { translate, useTranslation } from '@/hooks/use-translation';
import { firstErrors, minLength, required } from '@/lib/validation';
import { update } from '@/routes/password';

const MIN_PASSWORD_LENGTH = 8;

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    const { t } = useTranslation('auth');
    const { t: tError } = useTranslation('errors');

    // Mirrors ResetUserPassword's rules. Runs in JS rather than relying on the
    // inputs' `required`, which is only a hint: it can be deleted from the DOM,
    // and the route allows six attempts a minute.
    const validation = useClientValidation('reset-password-form', (data) =>
        firstErrors([
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

    return (
        <>
            <Head title={t('resetPassword.headTitle')} />

            <Form
                {...update.form()}
                id="reset-password-form"
                onBefore={validation.onBefore}
                onChange={validation.onChange}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {t('resetPassword.email')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="mt-1 block w-full"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {t('resetPassword.password')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                required
                                minLength={8}
                                autoFocus
                                placeholder={t(
                                    'resetPassword.passwordPlaceholder',
                                )}
                                passwordrules={passwordRules}
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
                                {t('resetPassword.confirmPassword')}
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block w-full"
                                required
                                minLength={8}
                                placeholder={t(
                                    'resetPassword.confirmPasswordPlaceholder',
                                )}
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={validation.error(
                                    'password_confirmation',
                                    errors.password_confirmation,
                                )}
                                className="mt-2"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {t('resetPassword.submit')}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = (props: { locale?: string }) => ({
    title: translate('auth', 'resetPassword.layoutTitle', props.locale),
    description: translate(
        'auth',
        'resetPassword.layoutDescription',
        props.locale,
    ),
});

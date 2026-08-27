import { Form, Head } from '@inertiajs/react';

import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useClientValidation } from '@/hooks/use-client-validation';
import { translate, useTranslation } from '@/hooks/use-translation';
import { firstErrors, required } from '@/lib/validation';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useTranslation('auth');
    const { t: tError } = useTranslation('errors');

    // This gate stands in front of the security settings and allows six
    // attempts a minute, so an empty submit must not spend one of them.
    const validation = useClientValidation('confirm-password-form', (data) =>
        firstErrors([
            {
                field: 'password',
                passes: required(data.password),
                message: tError('validation.required'),
            },
        ]),
    );

    return (
        <>
            <Head title={t('confirmPassword.title')} />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label={t('confirmPassword.passkeyLabel')}
                loadingLabel={t('confirmPassword.passkeyLoadingLabel')}
                separator={t('confirmPassword.passkeySeparator')}
            />

            <Form
                {...store.form()}
                id="confirm-password-form"
                onBefore={validation.onBefore}
                onChange={validation.onChange}
                resetOnSuccess={['password']}
            >
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {t('confirmPassword.password')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t(
                                    'confirmPassword.passwordPlaceholder',
                                )}
                                autoComplete="current-password"
                                required
                                autoFocus
                            />

                            <InputError
                                message={validation.error(
                                    'password',
                                    errors.password,
                                )}
                            />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('confirmPassword.submit')}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = (props: { locale?: string }) => ({
    title: translate('auth', 'confirmPassword.title', props.locale),
    description: translate('auth', 'confirmPassword.description', props.locale),
});

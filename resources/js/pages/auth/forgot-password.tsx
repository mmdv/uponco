// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientValidation } from '@/hooks/use-client-validation';
import { translate, useTranslation } from '@/hooks/use-translation';
import { email as isEmail, firstErrors, required } from '@/lib/validation';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation('auth');
    const { t: tError } = useTranslation('errors');

    // The route sends an email and allows six a minute, so an empty or
    // malformed address should never reach it.
    const validation = useClientValidation('forgot-password-form', (data) =>
        firstErrors([
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
        ]),
    );

    return (
        <>
            <Head title={t('forgotPassword.headTitle')} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form
                    {...email.form()}
                    id="forgot-password-form"
                    onBefore={validation.onBefore}
                    onChange={validation.onChange}
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('forgotPassword.email')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    required
                                    autoFocus
                                    placeholder={t(
                                        'forgotPassword.emailPlaceholder',
                                    )}
                                />

                                <InputError
                                    message={validation.error(
                                        'email',
                                        errors.email,
                                    )}
                                />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    {t('forgotPassword.submit')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>{t('forgotPassword.returnPrefix')}</span>
                    <TextLink href={login()}>
                        {t('forgotPassword.returnLink')}
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = (props: { locale?: string }) => ({
    title: translate('auth', 'forgotPassword.layoutTitle', props.locale),
    description: translate(
        'auth',
        'forgotPassword.layoutDescription',
        props.locale,
    ),
});

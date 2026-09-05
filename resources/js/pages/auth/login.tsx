import { Form, Head } from '@inertiajs/react';
import GoogleLoginButton from '@/components/google-login-button';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useClientValidation } from '@/hooks/use-client-validation';
import { translate, useTranslation } from '@/hooks/use-translation';
import { email as isEmail, firstErrors, required } from '@/lib/validation';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation('auth');
    const { t: tError } = useTranslation('errors');

    // Mirrors Fortify's login rules so an empty or malformed submission never
    // spends the route's throttle budget only to bounce back as a 422.
    const validation = useClientValidation('login-form', (data) =>
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
            {
                field: 'password',
                passes: required(data.password),
                message: tError('validation.required'),
            },
        ]),
    );

    return (
        <>
            <Head title={t('login.headTitle')} />

            <div className="mb-6">
                <GoogleLoginButton />
            </div>

            <PasskeyVerify />

            <Form
                {...store.form()}
                id="login-form"
                onBefore={validation.onBefore}
                onChange={validation.onChange}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('login.email')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('login.emailPlaceholder')}
                                />
                                <InputError
                                    message={validation.error(
                                        'email',
                                        errors.email,
                                    )}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        {t('login.password')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            {t('login.forgotPassword')}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('login.passwordPlaceholder')}
                                />
                                <InputError
                                    message={validation.error(
                                        'password',
                                        errors.password,
                                    )}
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                {/*
                                    On by default: the installed iOS app is
                                    launched from the home screen like any other
                                    app, and being dropped back to a login form
                                    every couple of hours is not what people
                                    expect from one. Unchecking it still limits
                                    the sign in to the session lifetime.
                                */}
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    defaultChecked
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">
                                    {t('login.rememberMe')}
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('login.submit')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('login.noAccount')}{' '}
                            <TextLink href={register()} tabIndex={5}>
                                {t('login.signUp')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = (props: { locale?: string }) => ({
    title: translate('auth', 'login.layoutTitle', props.locale),
    description: translate('auth', 'login.layoutDescription', props.locale),
});

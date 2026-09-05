import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import AccountController from '@/actions/App/Http/Controllers/Settings/AccountController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
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
import { edit } from '@/routes/security';
import { send } from '@/routes/verification';
import type { Auth, OwnedTeamsImpact } from '@/types';

const MIN_PASSWORD_LENGTH = 8;

type Props = {
    passwordRules: string;
    mustVerifyEmail: boolean;
    status?: string;
    ownedTeams: OwnedTeamsImpact;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security({
    mustVerifyEmail,
    status,
    ownedTeams,
    ...props
}: Props) {
    const { t } = useTranslation('settings');
    const { auth } = usePage<{ auth: Auth }>().props;
    const hasPassword = auth.hasPassword;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const accountPasswordInput = useRef<HTMLInputElement>(null);

    const { t: tError } = useTranslation('errors');

    // Both forms below are throttled at six a minute, so burning those attempts
    // on a blank field is a real way to lock yourself out. Checked in JS rather
    // than via `required`, which is only a hint.
    const accountValidation = useClientValidation(
        'account-email-form',
        (data) =>
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
                // OAuth-only accounts have no password to confirm.
                ...(hasPassword
                    ? [
                          {
                              field: 'current_password',
                              passes: required(data.current_password),
                              message: tError('validation.required'),
                          },
                      ]
                    : []),
            ]),
    );

    const passwordValidation = useClientValidation(
        'update-password-form',
        (data) =>
            firstErrors([
                {
                    field: 'current_password',
                    passes: required(data.current_password),
                    message: tError('validation.required'),
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

    return (
        <>
            <Head title={t('security.title')} />

            <h1 className="sr-only">{t('security.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('account.title')}
                    description={t('account.description')}
                />

                <Form
                    {...AccountController.update.form()}
                    id="account-email-form"
                    onBefore={accountValidation.onBefore}
                    onChange={accountValidation.onChange}
                    options={{ preserveScroll: true }}
                    resetOnError={['current_password']}
                    onError={(errors) => {
                        if (errors.current_password) {
                            accountPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('account.email')}
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder={t('account.emailPlaceholder')}
                                />

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-2 text-sm text-muted-foreground">
                                                {t('account.unverified')}{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    {t('account.resend')}
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    {t(
                                                        'account.verificationSent',
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <InputError
                                    className="mt-2"
                                    message={accountValidation.error(
                                        'email',
                                        errors.email,
                                    )}
                                />
                            </div>

                            {hasPassword ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="account_current_password">
                                        {t('account.currentPassword')}
                                    </Label>

                                    <PasswordInput
                                        id="account_current_password"
                                        ref={accountPasswordInput}
                                        name="current_password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder={t(
                                            'account.currentPasswordPlaceholder',
                                        )}
                                        required
                                    />

                                    <p className="text-sm text-muted-foreground">
                                        {t('account.currentPasswordHint')}
                                    </p>

                                    <InputError
                                        message={accountValidation.error(
                                            'current_password',
                                            errors.current_password,
                                        )}
                                    />
                                </div>
                            ) : null}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-account-button"
                                >
                                    {t('account.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="space-y-6" hidden={!hasPassword}>
                <Heading
                    variant="small"
                    title={t('security.title')}
                    description={t('security.description')}
                />

                <Form
                    {...SecurityController.update.form()}
                    id="update-password-form"
                    onBefore={passwordValidation.onBefore}
                    onChange={passwordValidation.onChange}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    {t('security.currentPassword')}
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder={t(
                                        'security.currentPasswordPlaceholder',
                                    )}
                                    required
                                />

                                <InputError
                                    message={passwordValidation.error(
                                        'current_password',
                                        errors.current_password,
                                    )}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('security.newPassword')}
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder={t(
                                        'security.newPasswordPlaceholder',
                                    )}
                                    passwordrules={props.passwordRules}
                                    required
                                    minLength={8}
                                />

                                <InputError
                                    message={passwordValidation.error(
                                        'password',
                                        errors.password,
                                    )}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('security.confirmPassword')}
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder={t(
                                        'security.confirmPasswordPlaceholder',
                                    )}
                                    passwordrules={props.passwordRules}
                                    required
                                    minLength={8}
                                />

                                <InputError
                                    message={passwordValidation.error(
                                        'password_confirmation',
                                        errors.password_confirmation,
                                    )}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    {t('security.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />

            <DeleteUser ownedTeams={ownedTeams} />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};

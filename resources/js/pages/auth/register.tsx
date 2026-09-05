import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import GoogleLoginButton from '@/components/google-login-button';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useClientValidation } from '@/hooks/use-client-validation';
import { useIsMobile } from '@/hooks/use-mobile';
import { translate, useTranslation } from '@/hooks/use-translation';
import {
    email as isEmail,
    firstErrors,
    minLength,
    required,
} from '@/lib/validation';
import { login, privacy, terms } from '@/routes';
import { store } from '@/routes/register';

const MIN_PASSWORD_LENGTH = 8;

type Props = {
    passwordRules: string;
    invitationEmail?: string;
    invitationTeam?: string | null;
};

export default function Register({
    passwordRules,
    invitationEmail,
    invitationTeam,
}: Props) {
    const { t } = useTranslation('auth');
    const { t: tError } = useTranslation('errors');

    // Autofocusing on a phone pops the keyboard open before the page has
    // settled, which scrolls the form out from under the user on arrival.
    const isMobile = useIsMobile();

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState<string | null>(null);

    // Mirrors CreateNewUser's rules so a submission already known to fail never
    // leaves the browser. Terms is checked alongside these below rather than
    // here: an unticked box is absent from FormData, so its state is the truth.
    const validation = useClientValidation('register-form', (data) =>
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

    return (
        <>
            <Head title={t('register.headTitle')} />

            {/* <div className="mb-6 flex flex-col gap-6">
                <GoogleLoginButton />

                <div className="relative text-center text-sm">
                    <span className="absolute inset-x-0 top-1/2 border-t" />
                    <span className="relative bg-background px-2 text-muted-foreground">
                        {t('register.orContinueWith')}
                    </span>
                </div>
            </div> */}

            <Form
                {...store.form()}
                id="register-form"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                onChange={validation.onChange}
                onBefore={() => {
                    // Evaluate both so every problem is reported at once, rather
                    // than making the user fix the fields and the box in turn.
                    const fieldsValid = validation.onBefore();

                    const termsValid = termsAccepted;

                    if (!termsValid) {
                        setTermsError(t('register.termsError'));
                    }

                    return fieldsValid && termsValid;
                }}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {invitationTeam && (
                                <p className="text-sm text-muted-foreground">
                                    {t('register.invited', {
                                        team: invitationTeam,
                                    })}
                                </p>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('register.name')}
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus={!isMobile}
                                    tabIndex={1}
                                    autoComplete="name"
                                    autoCapitalize="words"
                                    enterKeyHint="next"
                                    name="name"
                                    placeholder={t('register.namePlaceholder')}
                                />
                                <InputError
                                    message={validation.error(
                                        'name',
                                        errors.name,
                                    )}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('register.email')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    inputMode="email"
                                    enterKeyHint="next"
                                    name="email"
                                    placeholder={t('register.emailPlaceholder')}
                                    defaultValue={invitationEmail}
                                    readOnly={Boolean(invitationEmail)}
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
                                    {t('register.password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    enterKeyHint="next"
                                    name="password"
                                    placeholder={t(
                                        'register.passwordPlaceholder',
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
                                    {t('register.confirmPassword')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    enterKeyHint="go"
                                    name="password_confirmation"
                                    placeholder={t(
                                        'register.confirmPasswordPlaceholder',
                                    )}
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={validation.error(
                                        'password_confirmation',
                                        errors.password_confirmation,
                                    )}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="terms"
                                        name="terms"
                                        tabIndex={5}
                                        className="mt-0.5"
                                        data-test="register-terms"
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => {
                                            const accepted = checked === true;
                                            setTermsAccepted(accepted);

                                            if (accepted) {
                                                setTermsError(null);
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm leading-relaxed font-normal"
                                    >
                                        {t('register.termsBefore')}
                                        <a
                                            href={terms().url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4"
                                        >
                                            {t('register.termsLink')}
                                        </a>
                                        {t('register.termsSeparator')}
                                        <a
                                            href={privacy().url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4"
                                        >
                                            {t('register.privacyLink')}
                                        </a>
                                        {t('register.termsAfter')}
                                    </Label>
                                </div>
                                <InputError
                                    message={termsError ?? errors.terms}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('register.submit')}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('register.haveAccount')}{' '}
                            <TextLink href={login()} tabIndex={7}>
                                {t('register.logIn')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = (props: { locale?: string }) => ({
    title: translate('auth', 'register.layoutTitle', props.locale),
    description: translate('auth', 'register.layoutDescription', props.locale),
});

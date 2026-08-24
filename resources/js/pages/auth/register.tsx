import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { translate, useTranslation } from '@/hooks/use-translation';
import { login, privacy, terms } from '@/routes';
import { store } from '@/routes/register';

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

    // Autofocusing on a phone pops the keyboard open before the page has
    // settled, which scrolls the form out from under the user on arrival.
    const isMobile = useIsMobile();

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState<string | null>(null);

    return (
        <>
            <Head title={t('register.headTitle')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                onBefore={() => {
                    if (!termsAccepted) {
                        setTermsError(t('register.termsError'));

                        return false;
                    }

                    return true;
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
                                    message={errors.name}
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
                                <InputError message={errors.email} />
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
                                <InputError message={errors.password} />
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
                                    message={errors.password_confirmation}
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

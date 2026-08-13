import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
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
    // Autofocusing on a phone pops the keyboard open before the page has
    // settled, which scrolls the form out from under the user on arrival.
    const isMobile = useIsMobile();

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {invitationTeam && (
                                <p className="text-sm text-muted-foreground">
                                    You've been invited to join {invitationTeam}
                                    . Create your account to get started.
                                </p>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
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
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
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
                                    placeholder="email@example.com"
                                    defaultValue={invitationEmail}
                                    readOnly={Boolean(invitationEmail)}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    enterKeyHint="next"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    enterKeyHint="go"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
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
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm leading-relaxed font-normal"
                                    >
                                        I have read and agree to the{' '}
                                        <a
                                            href={terms().url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4"
                                        >
                                            Terms &amp; Conditions
                                        </a>{' '}
                                        and{' '}
                                        <a
                                            href={privacy().url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4"
                                        >
                                            Privacy Policy
                                        </a>
                                        .
                                    </Label>
                                </div>
                                <InputError message={errors.terms} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};

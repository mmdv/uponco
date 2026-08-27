import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { useClientValidation } from '@/hooks/use-client-validation';
import { useTranslation } from '@/hooks/use-translation';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { firstErrors, minLength, required } from '@/lib/validation';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const { t } = useTranslation('auth');
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const { t: tError } = useTranslation('errors');

    // Five attempts a minute, and a partial code can only ever be rejected —
    // so a half-typed one must not cost an attempt. Which field carries the
    // answer depends on the mode the user toggled into.
    const validation = useClientValidation(
        'two-factor-challenge-form',
        (data) =>
            showRecoveryInput
                ? firstErrors([
                      {
                          field: 'recovery_code',
                          passes: required(data.recovery_code),
                          message: tError('validation.required'),
                      },
                  ])
                : firstErrors([
                      {
                          field: 'code',
                          passes: required(data.code),
                          message: tError('validation.required'),
                      },
                      {
                          field: 'code',
                          passes: minLength(data.code, OTP_MAX_LENGTH),
                          message: tError('validation.otpLength', {
                              length: OTP_MAX_LENGTH,
                          }),
                      },
                  ]),
    );

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: t('twoFactor.recoveryTitle'),
                description: t('twoFactor.recoveryDescription'),
                toggleText: t('twoFactor.recoveryToggle'),
            };
        }

        return {
            title: t('twoFactor.authTitle'),
            description: t('twoFactor.authDescription'),
            toggleText: t('twoFactor.authToggle'),
        };
    }, [showRecoveryInput, t]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title={t('twoFactor.headTitle')} />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    id="two-factor-challenge-form"
                    onBefore={validation.onBefore}
                    onChange={validation.onChange}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder={t(
                                            'twoFactor.recoveryPlaceholder',
                                        )}
                                        autoFocus={showRecoveryInput}
                                        required
                                    />
                                    <InputError
                                        message={validation.error(
                                            'recovery_code',
                                            errors.recovery_code,
                                        )}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            autoFocus
                                        >
                                            <InputOTPGroup>
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError
                                        message={validation.error(
                                            'code',
                                            errors.code,
                                        )}
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {t('twoFactor.submit')}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <span>{t('twoFactor.orYouCan')}</span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

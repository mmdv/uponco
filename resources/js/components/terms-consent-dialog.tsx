import { Form, router, usePage } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { logout, privacy, terms } from '@/routes';
import { accept } from '@/routes/legal';

/**
 * Asks a signed-in user to agree to the terms when they have not already.
 *
 * Two situations reach here: someone who registered before there was a box to
 * tick, and someone who agreed to a version that has since been replaced. The
 * server decides which by sharing `termsConsent`, and the prop goes null the
 * moment they accept, which unmounts this.
 *
 * Deliberately not dismissible — no close button, no escape key, no click
 * outside. Consent that can be waved away is not consent, so the only ways out
 * are agreeing or logging out. The documents open in new tabs so reading them
 * does not throw away the dialog.
 */
export default function TermsConsentDialog() {
    const { termsConsent, name } = usePage().props;
    const { t } = useTranslation('legal');

    if (!termsConsent) {
        return null;
    }

    const variant = termsConsent.updated ? 'updated' : 'first';

    return (
        <Dialog open>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={(event) => event.preventDefault()}
                onPointerDownOutside={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
                data-test="terms-consent-dialog"
            >
                <DialogHeader>
                    <DialogTitle>{t(`consent.title.${variant}`)}</DialogTitle>
                    <DialogDescription>
                        {t(`consent.description.${variant}`, { app: name })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...accept.form()} disableWhileProcessing>
                    {({ processing, errors }) => (
                        <div className="grid gap-6">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="terms"
                                    name="terms"
                                    className="mt-0.5"
                                    data-test="terms-consent-checkbox"
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm leading-relaxed font-normal"
                                >
                                    {t('consent.agree')}{' '}
                                    <a
                                        href={terms().url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={t('consent.openInNewTab')}
                                        className="text-primary underline underline-offset-4"
                                    >
                                        {t('consent.terms')}
                                    </a>{' '}
                                    {t('consent.and')}{' '}
                                    <a
                                        href={privacy().url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={t('consent.openInNewTab')}
                                        className="text-primary underline underline-offset-4"
                                    >
                                        {t('consent.privacy')}
                                    </a>
                                    .
                                </Label>
                            </div>

                            <InputError
                                message={errors.terms && t('consent.required')}
                            />

                            <DialogFooter className="gap-2 sm:flex-col-reverse">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    data-test="terms-consent-submit"
                                >
                                    {processing && <Spinner />}
                                    {t('consent.submit')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => router.post(logout.url())}
                                >
                                    {t('consent.logout')}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

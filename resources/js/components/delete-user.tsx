import { Form, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import AccountController from '@/actions/App/Http/Controllers/Settings/AccountController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useClientValidation } from '@/hooks/use-client-validation';
import { useTranslation } from '@/hooks/use-translation';
import { firstErrors, required } from '@/lib/validation';
import { index as businessMembers } from '@/routes/company/business/members';
import type { Auth, OwnedTeamsImpact } from '@/types';

type Props = {
    ownedTeams: OwnedTeamsImpact;
};

export default function DeleteUser({ ownedTeams }: Props) {
    const { t } = useTranslation('settings');
    const { t: tError } = useTranslation('errors');
    const { auth } = usePage<{ auth: Auth }>().props;
    const hasPassword = auth.hasPassword;
    const passwordInput = useRef<HTMLInputElement>(null);

    const hasBlockingTeams = ownedTeams.shared.length > 0;

    // Mirrors AccountDeleteRequest: the current password must be present before
    // the request is worth making. OAuth-only accounts have no password.
    const validation = useClientValidation('delete-user-form', (data) =>
        firstErrors(
            hasPassword
                ? [
                      {
                          field: 'password',
                          passes: required(data.password),
                          message: tError('validation.required'),
                      },
                  ]
                : [],
        ),
    );

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title={t('deleteAccount.title')}
                description={t('deleteAccount.description')}
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">
                        {t('deleteAccount.warningTitle')}
                    </p>
                    <p className="text-sm">
                        {t('deleteAccount.warningDescription')}
                    </p>
                </div>

                <Dialog
                    onOpenChange={(nextOpen) => {
                        if (!nextOpen) {
                            validation.reset();
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            {t('deleteAccount.button')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            {t('deleteAccount.modalTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('deleteAccount.modalDescription')}
                        </DialogDescription>

                        {ownedTeams.solo.length > 0 ? (
                            <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm dark:border-red-200/10 dark:bg-red-700/10">
                                <p className="font-medium text-red-600 dark:text-red-100">
                                    {t('deleteAccount.soloTeamsTitle')}
                                </p>
                                <ul className="mt-2 space-y-1 text-red-600/90 dark:text-red-100/90">
                                    {ownedTeams.solo.map((team) => (
                                        <li
                                            key={team.name}
                                            data-test="delete-account-solo-team"
                                        >
                                            {team.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {hasBlockingTeams ? (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-200/10 dark:bg-amber-700/10">
                                <p className="font-medium text-amber-700 dark:text-amber-100">
                                    {t('deleteAccount.sharedTeamsTitle')}
                                </p>
                                <ul className="mt-2 space-y-1 text-amber-700/90 dark:text-amber-100/90">
                                    {ownedTeams.shared.map((team) => (
                                        <li
                                            key={team.name}
                                            data-test="delete-account-shared-team"
                                        >
                                            {team.name}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={businessMembers()}
                                    className="mt-3 inline-block font-medium text-amber-700 underline dark:text-amber-100"
                                >
                                    {t('deleteAccount.sharedTeamsAction')}
                                </Link>
                            </div>
                        ) : null}

                        <Form
                            {...AccountController.destroy.form()}
                            id="delete-user-form"
                            options={{
                                preserveScroll: true,
                            }}
                            onChange={validation.onChange}
                            onBefore={validation.onBefore}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        {hasPassword ? (
                                            <>
                                                <Label
                                                    htmlFor="password"
                                                    className="sr-only"
                                                >
                                                    {t(
                                                        'deleteAccount.passwordLabel',
                                                    )}
                                                </Label>

                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    ref={passwordInput}
                                                    placeholder={t(
                                                        'deleteAccount.passwordPlaceholder',
                                                    )}
                                                    autoComplete="current-password"
                                                />

                                                <InputError
                                                    message={validation.error(
                                                        'password',
                                                        errors.password,
                                                    )}
                                                />
                                            </>
                                        ) : null}

                                        <InputError message={errors.teams} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                {t('deleteAccount.cancel')}
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={
                                                processing || hasBlockingTeams
                                            }
                                            asChild
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                                disabled={
                                                    processing ||
                                                    hasBlockingTeams
                                                }
                                            >
                                                {t('deleteAccount.confirm')}
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

import { Form } from '@inertiajs/react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import { ScreenBody, ScreenFooterBar } from './onboarding-screen';
import ScreenHeader from './screen-header';

type Props = {
    data: Onboarding['profile'];
    controls: StepControls;
};

/** Marks a field the user cannot continue without. */
function RequiredMark() {
    return (
        <span className="text-destructive" aria-hidden>
            *
        </span>
    );
}

export default function StepProfile({ data, controls }: Props) {
    const { t } = useTranslation('onboard');
    const [name, setName] = useState(data.name);
    const [jobTitle, setJobTitle] = useState(data.job_title ?? '');

    return (
        <Form
            {...ProfileController.update.form()}
            options={{ preserveScroll: true }}
            onSuccess={controls.onComplete}
            className="flex min-h-full flex-1 flex-col"
        >
            {({ errors, processing }) => (
                <>
                    <ScreenBody>
                        <ScreenHeader
                            title={t('profile.title')}
                            description={t('profile.description')}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('profile.nameLabel')} <RequiredMark />
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    required
                                    aria-required
                                    autoComplete="name"
                                    placeholder={t('profile.namePlaceholder')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="job_title">
                                    {t('profile.jobTitleLabel')}{' '}
                                    <RequiredMark />
                                </Label>
                                <Input
                                    id="job_title"
                                    name="job_title"
                                    value={jobTitle}
                                    onChange={(event) =>
                                        setJobTitle(event.target.value)
                                    }
                                    placeholder={t(
                                        'profile.jobTitlePlaceholder',
                                    )}
                                    required
                                    aria-required
                                />
                                <InputError message={errors.job_title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('profile.emailLabel')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    defaultValue={data.email ?? ''}
                                    placeholder={t('profile.emailPlaceholder')}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    {t('profile.phoneLabel')}
                                </Label>
                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    defaultValue={data.phone ?? ''}
                                    placeholder={t('profile.phonePlaceholder')}
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="description">
                                    {t('profile.descriptionLabel')}
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={data.description ?? ''}
                                    placeholder={t(
                                        'profile.descriptionPlaceholder',
                                    )}
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </ScreenBody>

                    <ScreenFooterBar>
                        <OnboardingFooter
                            saving={processing || controls.saving}
                            disabled={
                                name.trim() === '' || jobTitle.trim() === ''
                            }
                        />
                    </ScreenFooterBar>
                </>
            )}
        </Form>
    );
}

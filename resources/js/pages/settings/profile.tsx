import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import AvatarUploader from '@/components/avatar-uploader';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { edit as editProfile } from '@/routes/profile';
import type { Auth } from '@/types';

type ProfileData = {
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    description: string | null;
};

export default function Profile({ profile }: { profile: ProfileData }) {
    const { t } = useTranslation('settings');
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title={t('profile.title')} />

            <h1 className="sr-only">{t('profile.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('profile.pictureTitle')}
                    description={t('profile.pictureDescription')}
                />

                <AvatarUploader user={auth.user} />

                <Heading
                    variant="small"
                    title={t('profile.title')}
                    description={t('profile.description')}
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('profile.name')}
                                </Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder={t('profile.namePlaceholder')}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('profile.publicEmail')}
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.email ?? ''}
                                    name="email"
                                    placeholder={t(
                                        'profile.publicEmailPlaceholder',
                                    )}
                                />

                                <p className="text-sm text-muted-foreground">
                                    {t('profile.publicEmailHint')}
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    {t('profile.phone')}
                                </Label>

                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    defaultValue={profile.phone ?? ''}
                                    placeholder={t('profile.phonePlaceholder')}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="job_title">
                                    {t('profile.jobTitle')}
                                </Label>

                                <Input
                                    id="job_title"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.job_title ?? ''}
                                    name="job_title"
                                    placeholder={t(
                                        'profile.jobTitlePlaceholder',
                                    )}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.job_title}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">
                                    {t('profile.descriptionLabel')}
                                </Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={profile.description ?? ''}
                                    placeholder={t(
                                        'profile.descriptionPlaceholder',
                                    )}
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.description}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {t('profile.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile',
            href: editProfile(),
        },
    ],
};

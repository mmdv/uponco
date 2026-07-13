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
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Profile" />

            <h1 className="sr-only">Profile</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile picture"
                    description="Public photo shown to customers when they book with you"
                />

                <AvatarUploader user={auth.user} />

                <Heading
                    variant="small"
                    title="Profile"
                    description="Public information shown to customers when they book with you"
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
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Public display name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Public email</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.email ?? ''}
                                    name="email"
                                    placeholder="Contact email shown to customers"
                                />

                                <p className="text-sm text-muted-foreground">
                                    This can differ from the email you use to
                                    sign in.
                                </p>

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>

                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    defaultValue={profile.phone ?? ''}
                                    placeholder="Contact phone number"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="job_title">Job title</Label>

                                <Input
                                    id="job_title"
                                    className="mt-1 block w-full"
                                    defaultValue={profile.job_title ?? ''}
                                    name="job_title"
                                    placeholder="e.g. Senior Stylist"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.job_title}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={profile.description ?? ''}
                                    placeholder="Tell customers about yourself and your work"
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
                                    Save
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

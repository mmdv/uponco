import { Form } from '@inertiajs/react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['profile'];
    controls: StepControls;
};

export default function StepProfile({ data, controls }: Props) {
    const [jobTitle, setJobTitle] = useState(data.job_title ?? '');

    return (
        <Form
            {...ProfileController.update.form()}
            options={{ preserveScroll: true }}
            onSuccess={controls.onComplete}
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={data.name}
                            required
                            autoComplete="name"
                            placeholder="Public display name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="job_title">Job title</Label>
                        <Input
                            id="job_title"
                            name="job_title"
                            value={jobTitle}
                            onChange={(event) =>
                                setJobTitle(event.target.value)
                            }
                            placeholder="e.g. Senior Stylist"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Required — shown next to your name.
                        </p>
                        <InputError message={errors.job_title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Public email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            defaultValue={data.email ?? ''}
                            placeholder="Contact email shown to customers"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <PhoneInput
                            id="phone"
                            name="phone"
                            defaultValue={data.phone ?? ''}
                            placeholder="Contact phone number"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={data.description ?? ''}
                            placeholder="Tell customers about yourself and your work"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <OnboardingFooter
                        showBack={controls.showBack}
                        onBack={controls.onBack}
                        saving={processing || controls.saving}
                        continueDisabled={jobTitle.trim() === ''}
                    />
                </>
            )}
        </Form>
    );
}

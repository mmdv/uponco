import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import OnboardController from '@/actions/App/Http/Controllers/OnboardController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import type { SelectOption } from '@/types';

type Props = {
    team: {
        name: string | null;
        timezone: string | null;
        businessCategory: string | null;
    };
    timezones: SelectOption[];
    businessCategories: SelectOption[];
};

export default function Onboard({
    team,
    timezones,
    businessCategories,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [businessCategory, setBusinessCategory] = useState(
        team.businessCategory ?? '',
    );
    const [timezone, setTimezone] = useState(team.timezone ?? '');

    return (
        <>
            <Head title="Set up your business" />

            <Form
                {...OnboardController.update.form(teamSlug)}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Company name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                name="name"
                                defaultValue={team.name ?? ''}
                                placeholder="Company name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <input
                                type="hidden"
                                name="business_category"
                                value={businessCategory}
                            />
                            <Label htmlFor="business_category">Category</Label>
                            <SearchableSelect
                                id="business_category"
                                options={businessCategories}
                                value={businessCategory}
                                onChange={setBusinessCategory}
                                placeholder="Select a category"
                                searchPlaceholder="Search categories…"
                                emptyMessage="No categories found."
                                invalid={Boolean(errors.business_category)}
                            />
                            <InputError message={errors.business_category} />
                        </div>

                        <div className="grid gap-2">
                            <input
                                type="hidden"
                                name="timezone"
                                value={timezone}
                            />
                            <Label htmlFor="timezone">Timezone</Label>
                            <SearchableSelect
                                id="timezone"
                                options={timezones}
                                value={timezone}
                                onChange={setTimezone}
                                placeholder="Select a timezone"
                                searchPlaceholder="Search timezones…"
                                emptyMessage="No timezones found."
                                invalid={Boolean(errors.timezone)}
                            />
                            <InputError message={errors.timezone} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={2}
                            data-test="onboard-submit-button"
                        >
                            {processing && <Spinner />}
                            Continue
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

Onboard.layout = {
    title: 'Set up your business',
    description: 'Tell us a little about your company to get started',
};

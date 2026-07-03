import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/Company/BusinessController';
import DeleteTeamModal from '@/components/delete-team-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import TeamLogoUploader from '@/components/team-logo-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import type { SelectOption, Team, TeamPermissions } from '@/types';

type Props = {
    team: Team;
    permissions: TeamPermissions;
    timezones: SelectOption[];
    businessCategories: SelectOption[];
};

export default function BusinessGeneral({
    team,
    permissions,
    timezones,
    businessCategories,
}: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [timezone, setTimezone] = useState(team.timezone ?? '');
    const [businessCategory, setBusinessCategory] = useState(
        team.businessCategory ?? '',
    );

    return (
        <>
            <Head title="Business" />

            <h1 className="sr-only">Business settings</h1>

            <div className="flex flex-col space-y-10">
                {permissions.canUpdateTeam ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Logo"
                            description="Add or update your company logo"
                        />

                        <TeamLogoUploader team={team} teamSlug={teamSlug} />
                    </div>
                ) : null}

                <div className="space-y-6">
                    {permissions.canUpdateTeam ? (
                        <>
                            <Heading
                                variant="small"
                                title="General"
                                description="Update your team name and settings"
                            />

                            <Form
                                {...BusinessController.update.form(teamSlug)}
                                options={{ preserveScroll: true }}
                                className="space-y-6"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <input
                                            type="hidden"
                                            name="timezone"
                                            value={timezone}
                                        />
                                        <input
                                            type="hidden"
                                            name="business_category"
                                            value={businessCategory}
                                        />

                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Team name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                data-test="team-name-input"
                                                defaultValue={team.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="business_category">
                                                Business category
                                            </Label>
                                            <SearchableSelect
                                                id="business_category"
                                                options={businessCategories}
                                                value={businessCategory}
                                                onChange={setBusinessCategory}
                                                placeholder="Select a category"
                                                searchPlaceholder="Search categories…"
                                                emptyMessage="No categories found."
                                                invalid={Boolean(
                                                    errors.business_category,
                                                )}
                                                data-test="team-category-select"
                                            />
                                            <InputError
                                                message={
                                                    errors.business_category
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="timezone">
                                                Timezone
                                            </Label>
                                            <SearchableSelect
                                                id="timezone"
                                                options={timezones}
                                                value={timezone}
                                                onChange={setTimezone}
                                                placeholder="Select a timezone"
                                                searchPlaceholder="Search timezones…"
                                                emptyMessage="No timezones found."
                                                invalid={Boolean(
                                                    errors.timezone,
                                                )}
                                                data-test="team-timezone-select"
                                            />
                                            <InputError
                                                message={errors.timezone}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                type="submit"
                                                data-test="team-save-button"
                                                disabled={processing}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </>
                    ) : (
                        <Heading variant="small" title={team.name} />
                    )}
                </div>

                {permissions.canDeleteTeam && !team.isPersonal ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Delete team"
                            description="Permanently delete your team"
                        />
                        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">
                                    Please proceed with caution, this cannot be
                                    undone.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                data-test="delete-team-button"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete team
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canDeleteTeam && !team.isPersonal ? (
                <DeleteTeamModal
                    team={team}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            ) : null}
        </>
    );
}

BusinessGeneral.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Business',
            href: props.currentTeam
                ? editBusiness(props.currentTeam.slug)
                : '/',
        },
    ],
});

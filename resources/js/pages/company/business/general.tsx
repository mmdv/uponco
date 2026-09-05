import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/Company/BusinessController';
import DeleteTeamModal from '@/components/delete-team-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTranslation } from '@/hooks/use-translation';
import { businessCategoryIcon } from '@/lib/business-category-icons';
import { index as companyIndex } from '@/routes/company';
import { edit as editBusiness } from '@/routes/company/business';
import type {
    SelectOption,
    Team,
    TeamDeletionSummary,
    TeamPermissions,
} from '@/types';

type Props = {
    team: Team;
    permissions: TeamPermissions;
    timezones: SelectOption[];
    businessCategories: SelectOption[];
    deletionSummary: TeamDeletionSummary;
};

export default function BusinessGeneral({
    team,
    permissions,
    timezones,
    businessCategories,
    deletionSummary,
}: Props) {
    const { t } = useTranslation('company');

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [timezone, setTimezone] = useState(team.timezone ?? '');
    const [businessCategory, setBusinessCategory] = useState(
        team.businessCategory ?? '',
    );

    // The same icon the customer meets on the booking page, so picking a
    // category here shows what it will look like there.
    const categoryOptions = businessCategories.map((option) => ({
        ...option,
        icon: businessCategoryIcon(option.value),
    }));

    return (
        <>
            <Head title={t('business.title')} />

            <h1 className="sr-only">{t('business.title')}</h1>

            <div className="flex flex-col space-y-10">
                <div className="space-y-6">
                    {permissions.canUpdateTeam ? (
                        <>
                            <Heading
                                variant="small"
                                title={t('business.general.title')}
                                description={t('business.general.description')}
                            />

                            <Form
                                {...BusinessController.update.form()}
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
                                                {t('business.general.teamName')}
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
                                                {t(
                                                    'business.general.businessCategory',
                                                )}
                                            </Label>
                                            <SearchableSelect
                                                id="business_category"
                                                options={categoryOptions}
                                                value={businessCategory}
                                                onChange={setBusinessCategory}
                                                placeholder={t(
                                                    'business.general.businessCategoryPlaceholder',
                                                )}
                                                searchPlaceholder={t(
                                                    'business.general.businessCategorySearchPlaceholder',
                                                )}
                                                emptyMessage={t(
                                                    'business.general.businessCategoryEmpty',
                                                )}
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

                                        {businessCategory === 'other' ? (
                                            <div className="grid gap-2">
                                                <Label htmlFor="business_category_other">
                                                    {t(
                                                        'business.general.businessCategoryOther',
                                                    )}
                                                </Label>
                                                <Input
                                                    id="business_category_other"
                                                    name="business_category_other"
                                                    maxLength={100}
                                                    data-test="team-category-other-input"
                                                    defaultValue={
                                                        team.businessCategoryOther ??
                                                        ''
                                                    }
                                                    placeholder={t(
                                                        'business.general.businessCategoryOtherPlaceholder',
                                                    )}
                                                />
                                                <InputError
                                                    message={
                                                        errors.business_category_other
                                                    }
                                                />
                                            </div>
                                        ) : null}

                                        <div className="grid gap-2">
                                            <Label htmlFor="timezone">
                                                {t('business.general.timezone')}
                                            </Label>
                                            <SearchableSelect
                                                id="timezone"
                                                options={timezones}
                                                value={timezone}
                                                onChange={setTimezone}
                                                placeholder={t(
                                                    'business.general.timezonePlaceholder',
                                                )}
                                                searchPlaceholder={t(
                                                    'business.general.timezoneSearchPlaceholder',
                                                )}
                                                emptyMessage={t(
                                                    'business.general.timezoneEmpty',
                                                )}
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
                                                {t('business.general.save')}
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
                            title={t('business.deleteTeam.title')}
                            description={t('business.deleteTeam.description')}
                        />
                        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">
                                    {t('business.deleteTeam.warningTitle')}
                                </p>
                                <p className="text-sm">
                                    {t(
                                        'business.deleteTeam.warningDescription',
                                    )}
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                data-test="delete-team-button"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                {t('business.deleteTeam.button')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canDeleteTeam && !team.isPersonal ? (
                <DeleteTeamModal
                    team={team}
                    deletionSummary={deletionSummary}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            ) : null}
        </>
    );
}

BusinessGeneral.layout = () => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: companyIndex(),
        },
        {
            title: 'Business',
            href: editBusiness(),
        },
    ],
});

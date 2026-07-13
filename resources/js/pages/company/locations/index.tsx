import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import DeleteLocationModal from '@/components/locations/delete-location-modal';
import LocationFormDrawer from '@/components/locations/location-form-drawer';
import LocationsGrid from '@/components/locations/locations-grid';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { index as companyIndex } from '@/routes/company';
import { index as locationsIndex } from '@/routes/company/locations';
import type { Location, SelectOption } from '@/types';

type Props = {
    locations: Location[];
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
};

export default function LocationsIndex({
    locations,
    services,
    specialists,
    countries,
}: Props) {
    const { t } = useTranslation('locations');
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Location | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Location | null>(null);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (location: Location) => {
        setEditing(location);
        setFormOpen(true);
    };

    const confirmDelete = (location: Location) => {
        setDeleting(location);
        setDeleteOpen(true);
    };

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={t('title')}
                        description={t('description')}
                    />

                    <Button
                        data-test="add-location-button"
                        onClick={openCreate}
                    >
                        <Plus /> {t('addLocation')}
                    </Button>
                </div>

                <LocationsGrid
                    locations={locations}
                    countries={countries}
                    onEdit={openEdit}
                    onDelete={confirmDelete}
                />
            </div>

            <LocationFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                location={editing}
                teamSlug={teamSlug}
                services={services}
                specialists={specialists}
                countries={countries}
            />

            <DeleteLocationModal
                location={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </>
    );
}

LocationsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
        {
            title: 'Locations',
            href: props.currentTeam
                ? locationsIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});

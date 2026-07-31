import LocationFormFields from '@/components/locations/location-form-fields';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import type { Location, SelectOption } from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: Location | null;
    teamSlug: string;
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    /** Off when the surrounding flow owns the service/specialist assignments. */
    showAssignments?: boolean;
};

export default function LocationFormModal({
    open,
    onOpenChange,
    location,
    teamSlug,
    services,
    specialists,
    countries,
    showAssignments = true,
}: Props) {
    const { t } = useTranslation('locations');
    const isEditing = location !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
                    <DialogTitle>
                        {isEditing ? t('form.editTitle') : t('form.newTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? t('form.editDescription')
                            : t('form.newDescription')}
                    </DialogDescription>
                </DialogHeader>

                <LocationFormFields
                    key={location?.id ?? 'new'}
                    location={location}
                    teamSlug={teamSlug}
                    services={services}
                    specialists={specialists}
                    countries={countries}
                    showAssignments={showAssignments}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

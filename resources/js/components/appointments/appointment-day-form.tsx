import AppointmentDayFormFields from '@/components/appointments/appointment-day-form-fields';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    specialist: AppointmentSpecialistOption | null;
    /** ISO-8601 UTC instant of the clicked slot start (or the edited start). */
    startIso: string | null;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    /** The appointment being edited, or null when quick-creating. */
    appointment: Appointment | null;
    onSuccess: () => void;
    /** Add a placeholder appointment to the grid the moment the form submits. */
    onOptimisticAdd: (appointment: Appointment) => void;
    /** Roll the placeholder back out if the create fails. */
    onOptimisticRemove: (tempId: number) => void;
};

export default function AppointmentDayForm({
    open,
    onOpenChange,
    specialist,
    startIso,
    timezone,
    services,
    locations,
    appointment,
    onSuccess,
    onOptimisticAdd,
    onOptimisticRemove,
}: Props) {
    const { t } = useTranslation('appointments');
    const isEditing = appointment !== null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md md:max-w-3xl">
                {specialist && startIso && (
                    <>
                        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
                            <DialogTitle>
                                {isEditing
                                    ? t('dayForm.editTitle', {
                                          name: specialist.name,
                                      })
                                    : t('dayForm.title', {
                                          name: specialist.name,
                                      })}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? t('dayForm.editDescription')
                                    : t('dayForm.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <AppointmentDayFormFields
                            key={`${appointment?.id ?? 'new'}:${specialist.id}:${startIso}`}
                            specialist={specialist}
                            startIso={startIso}
                            timezone={timezone}
                            services={services}
                            locations={locations}
                            appointment={appointment}
                            onSuccess={onSuccess}
                            onCancel={() => onOpenChange(false)}
                            onOptimisticAdd={onOptimisticAdd}
                            onOptimisticRemove={onOptimisticRemove}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

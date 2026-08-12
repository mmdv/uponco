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
    /** ISO-8601 UTC instant of the clicked slot start. */
    startIso: string | null;
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
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
    onSuccess,
    onOptimisticAdd,
    onOptimisticRemove,
}: Props) {
    const { t } = useTranslation('appointments');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md md:max-w-3xl">
                {specialist && startIso && (
                    <>
                        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
                            <DialogTitle>
                                {t('dayForm.title', { name: specialist.name })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('dayForm.description')}
                            </DialogDescription>
                        </DialogHeader>

                        <AppointmentDayFormFields
                            key={`${specialist.id}:${startIso}`}
                            specialist={specialist}
                            startIso={startIso}
                            timezone={timezone}
                            services={services}
                            locations={locations}
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

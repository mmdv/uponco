import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import {
    appointmentCustomerLabel,
    formatAppointmentDay,
} from '@/lib/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processing: boolean;
    onConfirm: (appointment: Appointment) => void;
};

/**
 * Confirmation dialog for deleting a past appointment. The deletion itself is
 * driven by the parent so it can update the list optimistically — this component
 * only collects the confirmation.
 */
export default function DeleteAppointmentModal({
    appointment,
    open,
    onOpenChange,
    processing,
    onConfirm,
}: Props) {
    const { t } = useTranslation('appointments');

    const deleteAppointment = () => {
        if (!appointment) {
            return;
        }

        onConfirm(appointment);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('delete.title')}</DialogTitle>
                    <DialogDescription>
                        {appointment
                            ? t('delete.confirmWithDate', {
                                  name: appointmentCustomerLabel(
                                      appointment,
                                      t('customer.noName'),
                                  ),
                                  date: formatAppointmentDay(
                                      appointment.start_at,
                                      appointment.timezone,
                                  ),
                              })
                            : t('delete.confirm', { name: '' })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('delete.dismiss')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="delete-appointment-confirm"
                        disabled={processing}
                        onClick={deleteAppointment}
                    >
                        {t('delete.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

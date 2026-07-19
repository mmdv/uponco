import { router } from '@inertiajs/react';
import { useState } from 'react';

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
import { formatAppointmentDay } from '@/lib/appointments';
import { destroy } from '@/routes/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    teamSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteAppointmentModal({
    appointment,
    teamSlug,
    open,
    onOpenChange,
}: Props) {
    const { t } = useTranslation('appointments');
    const [processing, setProcessing] = useState(false);

    const deleteAppointment = () => {
        if (!appointment) {
            return;
        }

        router.visit(destroy([teamSlug, appointment.id]), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('delete.title')}</DialogTitle>
                    <DialogDescription>
                        {appointment
                            ? t('delete.confirmWithDate', {
                                  name: appointment.customer.name,
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
                            {t('delete.cancel')}
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

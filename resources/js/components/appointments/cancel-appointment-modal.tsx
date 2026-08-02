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
import { cancel } from '@/routes/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancelled?: () => void;
};

export default function CancelAppointmentModal({
    appointment,
    open,
    onOpenChange,
    onCancelled,
}: Props) {
    const { t } = useTranslation('appointments');
    const [processing, setProcessing] = useState(false);

    const cancelAppointment = () => {
        if (!appointment) {
            return;
        }

        router.visit(cancel([appointment.id]), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                onOpenChange(false);
                onCancelled?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('cancel.title')}</DialogTitle>
                    <DialogDescription>
                        {appointment
                            ? t('cancel.confirmWithDate', {
                                  name: appointment.customer.name,
                                  date: formatAppointmentDay(
                                      appointment.start_at,
                                      appointment.timezone,
                                  ),
                              })
                            : t('cancel.confirm', { name: '' })}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('cancel.dismiss')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="cancel-appointment-confirm"
                        disabled={processing}
                        onClick={cancelAppointment}
                    >
                        {t('cancel.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

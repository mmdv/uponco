import { router } from '@inertiajs/react';
import { useState } from 'react';

import { isPastAppointment } from '@/lib/appointments';
import {
    cancel as cancelRoute,
    reschedule as rescheduleRoute,
} from '@/routes/appointments';
import type { Appointment } from '@/types';

function byStartAscending(a: Appointment, b: Appointment): number {
    return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
}

type CancelCallbacks = {
    onSuccess?: () => void;
    onError?: () => void;
};

type OptimisticAppointments = {
    /** The list to render: server data with any optimistic edits applied. */
    appointments: Appointment[];
    cancelProcessing: boolean;
    /** Optimistically remove and cancel on the server, rolling back on failure. */
    cancel: (appointment: Appointment, callbacks?: CancelCallbacks) => void;
    /** Optimistically add a (temp-id) appointment to the list. */
    add: (appointment: Appointment) => void;
    /** Remove an optimistic appointment by its temp id. */
    remove: (tempId: number) => void;
    /** Move an appointment to a new start (drag-and-drop), reconciled by reload. */
    reschedule: (appointment: Appointment, startIso: string) => void;
};

/**
 * A local overlay on the server's appointments that supports optimistic create
 * and cancel: the list updates instantly and a partial reload reconciles it, so
 * the viewed day and scroll position are never lost to a full page refresh.
 *
 * The overlay re-syncs whenever the server prop changes — done during render
 * (the React-recommended way to reset state from props) rather than in an
 * effect, so there is no extra render pass.
 */
export function useOptimisticAppointments(
    serverAppointments: Appointment[],
): OptimisticAppointments {
    const [appointments, setAppointments] = useState(serverAppointments);
    const [syncedFrom, setSyncedFrom] = useState(serverAppointments);
    const [cancelProcessing, setCancelProcessing] = useState(false);

    if (serverAppointments !== syncedFrom) {
        setSyncedFrom(serverAppointments);
        setAppointments(serverAppointments);
    }

    const add = (appointment: Appointment) => {
        setAppointments((prev) =>
            [...prev, appointment].sort(byStartAscending),
        );
    };

    const remove = (tempId: number) => {
        setAppointments((prev) => prev.filter((item) => item.id !== tempId));
    };

    const cancel = (appointment: Appointment, callbacks?: CancelCallbacks) => {
        const snapshot = appointments;

        remove(appointment.id);

        router.visit(cancelRoute([appointment.id]), {
            only: ['appointments'],
            preserveScroll: true,
            preserveState: true,
            onStart: () => setCancelProcessing(true),
            onFinish: () => setCancelProcessing(false),
            onSuccess: () => callbacks?.onSuccess?.(),
            onError: () => {
                setAppointments(snapshot);
                callbacks?.onError?.();
            },
        });
    };

    const reschedule = (appointment: Appointment, startIso: string) => {
        if (isPastAppointment(appointment)) {
            return;
        }

        router.patch(
            rescheduleRoute.url([appointment.id]),
            { start_at: startIso },
            {
                only: ['appointments'],
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return { appointments, cancelProcessing, cancel, add, remove, reschedule };
}

import { Head, router, usePage, usePoll } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import AppointmentDetailsModal from '@/components/appointments/appointment-details-modal';
import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import AppointmentsTable from '@/components/appointments/appointments-table';
import AppointmentsToolbar, {
    EMPTY_FILTERS,
} from '@/components/appointments/appointments-toolbar';
import type {
    AppointmentFilters,
    AppointmentTab,
    AppointmentView,
} from '@/components/appointments/appointments-toolbar';
import AppointmentCalendar from '@/components/appointments/calendar/appointment-calendar';
import DeleteAppointmentModal from '@/components/appointments/delete-appointment-modal';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { isPastAppointment, toDateInputValue } from '@/lib/appointments';
import {
    index as appointmentsIndex,
    reschedule as rescheduleRoute,
} from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    appointments: Appointment[];
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
};

export default function AppointmentsIndex({
    appointments,
    timezone,
    services,
    locations,
    specialists,
    availableSlots = [],
}: Props) {
    const { auth, currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    // Admins and owners may edit any appointment; members only the ones where
    // they are the assigned specialist. Mirrors the backend authorization.
    const isTeamAdmin =
        currentTeam?.role === 'admin' || currentTeam?.role === 'owner';
    // Past appointments are read-only: they can only be previewed, never edited,
    // rescheduled or deleted. The backend enforces this too.
    const canEditAppointment = (appointment: Appointment) =>
        !isPastAppointment(appointment) &&
        (isTeamAdmin || appointment.specialist_id === auth.user.id);

    // Keep the list fresh without a full reload: every 5s Inertia re-runs only
    // the `appointments` prop on the server and merges it in, preserving local
    // UI state (open drawer, active tab). Throttles automatically when the tab
    // is in the background.
    usePoll(5000, { only: ['appointments'] });

    const [tab, setTab] = useLocalStorage<AppointmentTab>(
        'appointments:tab',
        'upcoming',
    );
    const [view, setView] = useLocalStorage<AppointmentView>(
        'appointments:view',
        'minimal',
    );
    const [filters, setFilters] = useLocalStorage<AppointmentFilters>(
        'appointments:filters:v2',
        EMPTY_FILTERS,
    );
    const [cursor, setCursor] = useState<Date>(() => new Date());

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<Appointment | null>(null);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewing, setViewing] = useState<Appointment | null>(null);

    // Apply the toolbar facet filters (location / service / specialist) before
    // anything else so every view — minimal and calendar — sees the same set.
    const filteredAppointments = useMemo(() => {
        return appointments.filter((appointment) => {
            if (
                filters.locationIds.length > 0 &&
                !filters.locationIds.includes(String(appointment.location_id))
            ) {
                return false;
            }

            if (
                filters.serviceIds.length > 0 &&
                !filters.serviceIds.includes(String(appointment.service_id))
            ) {
                return false;
            }

            if (
                filters.specialistIds.length > 0 &&
                !filters.specialistIds.includes(
                    String(appointment.specialist_id),
                )
            ) {
                return false;
            }

            return true;
        });
    }, [appointments, filters]);

    // Appointments arrive ordered ascending by start. Upcoming keeps that order
    // (closest future first); past is reversed so it reads closest-to-now first.
    const { upcoming, past } = useMemo(() => {
        const now = new Date().getTime();
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];

        for (const appointment of filteredAppointments) {
            if (new Date(appointment.start_at).getTime() >= now) {
                upcoming.push(appointment);
            } else {
                past.push(appointment);
            }
        }

        return { upcoming, past: past.reverse() };
    }, [filteredAppointments]);

    const activeAppointments = tab === 'upcoming' ? upcoming : past;

    const requestSlots = (request: SlotRequest) => {
        router.reload({
            only: ['availableSlots'],
            data: {
                service_id: request.serviceId,
                specialist_id: request.specialistId,
                date: request.date,
                appointment_id: request.appointmentId ?? '',
            },
            onStart: () => setSlotsLoading(true),
            onFinish: () => setSlotsLoading(false),
        });
    };

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (appointment: Appointment) => {
        // Past appointments are read-only — surface the preview instead of the
        // edit form (e.g. when a past event is clicked in the calendar).
        if (isPastAppointment(appointment)) {
            openDetails(appointment);

            return;
        }

        setEditing(appointment);
        setFormOpen(true);

        requestSlots({
            serviceId: appointment.service_id,
            specialistId: appointment.specialist_id,
            date: toDateInputValue(appointment.start_at, timezone),
            appointmentId: appointment.id,
        });
    };

    const confirmDelete = (appointment: Appointment) => {
        setDeleting(appointment);
        setDeleteOpen(true);
    };

    const openDetails = (appointment: Appointment) => {
        setViewing(appointment);
        setDetailsOpen(true);
    };

    const reschedule = (appointment: Appointment, startIso: string) => {
        if (isPastAppointment(appointment)) {
            return;
        }

        router.patch(
            rescheduleRoute.url([teamSlug, appointment.id]),
            { start_at: startIso },
            {
                only: ['appointments'],
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const hasBookableResources = services.length > 0 && specialists.length > 0;

    return (
        <>
            <Head title="Appointments" />

            <div className="flex flex-col space-y-6 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Heading variant="small" title="Appointments" />

                    <Button
                        className="w-full sm:w-auto"
                        data-test="add-appointment-button"
                        disabled={!hasBookableResources}
                        onClick={openCreate}
                    >
                        <Plus /> New appointment
                    </Button>
                </div>

                <AppointmentsToolbar
                    filters={filters}
                    onFiltersChange={setFilters}
                    services={services}
                    locations={locations}
                    specialists={specialists}
                    tab={tab}
                    onTabChange={setTab}
                    upcomingCount={upcoming.length}
                    pastCount={past.length}
                    view={view}
                    onViewChange={setView}
                />

                {view === 'minimal' ? (
                    <AppointmentsTable
                        appointments={activeAppointments}
                        onView={openDetails}
                        onEdit={openEdit}
                        onDelete={confirmDelete}
                        canModify={(appointment) =>
                            !isPastAppointment(appointment)
                        }
                        emptyMessage={
                            tab === 'upcoming'
                                ? 'No upcoming appointments.'
                                : 'No past appointments.'
                        }
                    />
                ) : (
                    <AppointmentCalendar
                        view={view}
                        date={cursor}
                        onDateChange={setCursor}
                        onViewChange={setView}
                        appointments={activeAppointments}
                        timezone={timezone}
                        onEditAppointment={openEdit}
                        onReschedule={reschedule}
                    />
                )}
            </div>

            <AppointmentFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                appointment={editing}
                teamSlug={teamSlug}
                timezone={timezone}
                services={services}
                locations={locations}
                specialists={specialists}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onRequestSlots={requestSlots}
            />

            <DeleteAppointmentModal
                appointment={deleting}
                teamSlug={teamSlug}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />

            <AppointmentDetailsModal
                appointment={viewing}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                canEdit={viewing ? canEditAppointment(viewing) : false}
                onEdit={(appointment) => {
                    setDetailsOpen(false);
                    openEdit(appointment);
                }}
            />
        </>
    );
}

AppointmentsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Appointments',
            href: props.currentTeam
                ? appointmentsIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});

import { Head, router, usePage } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import AppointmentDayForm from '@/components/appointments/appointment-day-form';
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
import CancelAppointmentModal from '@/components/appointments/cancel-appointment-modal';
import CustomerPreviewModal from '@/components/customers/customer-preview-modal';
import { useDayColumns } from '@/hooks/use-day-columns';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useOptimisticAppointments } from '@/hooks/use-optimistic-appointments';
import { useTranslation } from '@/hooks/use-translation';
import { partitionAppointments } from '@/lib/appointment-partition';
import { isPastAppointment, toDateInputValue } from '@/lib/appointments';
import { dateKey } from '@/lib/calendar-grid';
import { index as appointmentsIndex } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
    Customer,
    WorkingHoursMap,
} from '@/types';

type Props = {
    appointments: Appointment[];
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
    workingHours?: WorkingHoursMap;
};

export default function AppointmentsIndex({
    appointments,
    timezone,
    services,
    locations,
    specialists,
    availableSlots = [],
    workingHours = {},
}: Props) {
    const { t } = useTranslation('appointments');
    const { auth, currentTeam } = usePage().props;

    // Admins and owners may edit any appointment; members only the ones where
    // they are the assigned specialist. Mirrors the backend authorization.
    const isTeamAdmin =
        currentTeam?.role === 'admin' || currentTeam?.role === 'owner';
    // Past appointments are read-only: they can only be previewed, never edited,
    // rescheduled or cancelled. The backend enforces this too.
    const canEditAppointment = (appointment: Appointment) =>
        !isPastAppointment(appointment) &&
        (isTeamAdmin || appointment.specialist_id === auth.user.id);

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

    // Day-view quick-create/edit: clicking an empty slot opens a modal prefilled
    // with that column's specialist and the clicked time; editing an individual
    // appointment reuses the same free-form modal, prefilled from the booking.
    const [dayFormOpen, setDayFormOpen] = useState(false);
    const [daySpecialist, setDaySpecialist] =
        useState<AppointmentSpecialistOption | null>(null);
    const [dayStartIso, setDayStartIso] = useState<string | null>(null);
    const [dayEditing, setDayEditing] = useState<Appointment | null>(null);

    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelling, setCancelling] = useState<Appointment | null>(null);

    // Optimistic overlay on the server's appointments, so create and cancel land
    // instantly without a full refresh that would lose the viewed day and scroll.
    const {
        appointments: localAppointments,
        cancelProcessing,
        cancel: cancelAppointment,
        add: addOptimisticAppointment,
        remove: removeOptimisticAppointment,
        reschedule,
    } = useOptimisticAppointments(appointments);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewing, setViewing] = useState<Appointment | null>(null);

    const [customerOpen, setCustomerOpen] = useState(false);
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(
        null,
    );

    // Hide redundant columns/filters: a single location or a single team member
    // carries no information worth a whole column.
    const showLocation = locations.length > 1;
    const showSpecialist = specialists.length > 1;

    // Apply the toolbar facet filters, then split into upcoming and past so every
    // view — minimal and calendar — sees the same set.
    const { upcoming, past } = useMemo(
        () => partitionAppointments(localAppointments, filters),
        [localAppointments, filters],
    );

    const activeAppointments = tab === 'upcoming' ? upcoming : past;

    const cursorKey = dateKey(cursor);

    const { dayColumns, workingHoursLoading } = useDayColumns({
        view,
        cursorKey,
        specialists,
        workingHours,
        specialistFilterIds: filters.specialistIds,
    });

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

        // In the day view, edit through the free-form day modal so the time and
        // duration can be changed directly. Only individual services fit that
        // modal; anything else falls through to the slot-picker drawer.
        const service = services.find(
            (item) => item.id === appointment.service_id,
        );
        const specialist = specialists.find(
            (item) => item.id === appointment.specialist_id,
        );

        if (
            view === 'day' &&
            service?.service_type === 'individual' &&
            specialist
        ) {
            setDaySpecialist(specialist);
            setDayStartIso(appointment.start_at);
            setDayEditing(appointment);
            setDayFormOpen(true);

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

    const confirmCancel = (appointment: Appointment) => {
        setCancelling(appointment);
        setCancelOpen(true);
    };

    const handleConfirmCancel = (appointment: Appointment) => {
        cancelAppointment(appointment, {
            onSuccess: () => {
                setCancelOpen(false);
                setFormOpen(false);
            },
            onError: () => toast.error(t('toast.cancelError')),
        });
    };

    const openDetails = (appointment: Appointment) => {
        setViewing(appointment);
        setDetailsOpen(true);
    };

    const openCustomer = (appointment: Appointment) => {
        // A note-only appointment has no customer to preview.
        if (appointment.customer.id === null) {
            return;
        }

        setViewingCustomer({
            ...appointment.customer,
            id: appointment.customer.id,
        });
        setCustomerOpen(true);
    };

    const handleCreateSlot = (specialistId: number, startIso: string) => {
        const specialist = specialists.find((item) => item.id === specialistId);

        if (!specialist) {
            return;
        }

        setDayEditing(null);
        setDaySpecialist(specialist);
        setDayStartIso(startIso);
        setDayFormOpen(true);
    };

    const hasBookableResources = services.length > 0 && specialists.length > 0;

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-col space-y-4 p-4">
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
                    onCreate={openCreate}
                    canCreate={hasBookableResources}
                    showLocation={showLocation}
                    showSpecialist={showSpecialist}
                />

                {view === 'minimal' ? (
                    <AppointmentsTable
                        appointments={activeAppointments}
                        onView={openDetails}
                        onEdit={openEdit}
                        onCancel={confirmCancel}
                        onViewCustomer={openCustomer}
                        canModify={(appointment) =>
                            !isPastAppointment(appointment)
                        }
                        showLocation={showLocation}
                        showSpecialist={showSpecialist}
                        emptyMessage={
                            tab === 'upcoming'
                                ? t('empty.upcoming')
                                : t('empty.past')
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
                        dayColumns={dayColumns}
                        workingHoursLoading={workingHoursLoading}
                        onSelectAppointment={openDetails}
                        onReschedule={reschedule}
                        onCreateSlot={handleCreateSlot}
                    />
                )}
            </div>

            {/* Mobile: create lives in a floating action button, off the toolbar.
                Matches the dashboard quick-actions FAB — safe-area aware, clears
                the bottom nav, gradient with a soft shadow. */}
            <button
                type="button"
                className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(4rem+1rem+env(safe-area-inset-bottom))] z-50 flex size-14 items-center justify-center rounded-full bg-primary-gradient text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:hidden"
                data-test="add-appointment-fab"
                aria-label={t('newAppointment')}
                disabled={!hasBookableResources}
                onClick={openCreate}
            >
                <CalendarPlus className="size-6" />
            </button>

            <AppointmentFormDrawer
                open={formOpen}
                onOpenChange={setFormOpen}
                appointment={editing}
                timezone={timezone}
                services={services}
                locations={locations}
                specialists={specialists}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onRequestSlots={requestSlots}
                onCancelAppointment={confirmCancel}
            />

            <AppointmentDayForm
                open={dayFormOpen}
                onOpenChange={setDayFormOpen}
                specialist={daySpecialist}
                startIso={dayStartIso}
                timezone={timezone}
                services={services}
                locations={locations}
                appointment={dayEditing}
                onSuccess={() => setDayFormOpen(false)}
                onOptimisticAdd={addOptimisticAppointment}
                onOptimisticRemove={removeOptimisticAppointment}
            />

            <CancelAppointmentModal
                appointment={cancelling}
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                processing={cancelProcessing}
                onConfirm={handleConfirmCancel}
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

            <CustomerPreviewModal
                customer={viewingCustomer}
                open={customerOpen}
                onOpenChange={setCustomerOpen}
            />
        </>
    );
}

AppointmentsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Appointments',
            href: appointmentsIndex(),
        },
    ],
});

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
    AppointmentView,
} from '@/components/appointments/appointments-toolbar';
import AppointmentCalendar from '@/components/appointments/calendar/appointment-calendar';
import CalendarDateNav from '@/components/appointments/calendar/calendar-date-nav';
import CancelAppointmentModal from '@/components/appointments/cancel-appointment-modal';
import CustomerPreviewModal from '@/components/customers/customer-preview-modal';
import { useDayColumns } from '@/hooks/use-day-columns';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useOfflineGuard } from '@/hooks/use-offline-guard';
import { useOptimisticAppointments } from '@/hooks/use-optimistic-appointments';
import { useTranslation } from '@/hooks/use-translation';
import { filterAppointments } from '@/lib/appointment-filters';
import { isPastAppointment, toDateInputValue } from '@/lib/appointments';
import { appointmentDateKey, dateKey, weekDays } from '@/lib/calendar-grid';
import { index as appointmentsIndex } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
    Customer,
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
    const { t } = useTranslation('appointments');
    const { auth, currentTeam } = usePage().props;

    // Offline the page shows only the cached appointments, so every write is
    // blocked at its entry point (a toast explains why). Viewing details and
    // customer previews stay available.
    const { isOnline, blockWhenOffline } = useOfflineGuard();

    // Admins and owners may edit any appointment; members only the ones where
    // they are the assigned specialist. Mirrors the backend authorization.
    const isTeamAdmin =
        currentTeam?.role === 'admin' || currentTeam?.role === 'owner';
    // Past appointments are read-only: they can only be previewed, never edited,
    // rescheduled or cancelled. The backend enforces this too.
    const canEditAppointment = (appointment: Appointment) =>
        !isPastAppointment(appointment) &&
        (isTeamAdmin || appointment.specialist_id === auth.user.id);

    const [view, setView] = useLocalStorage<AppointmentView>(
        'appointments:view',
        'day',
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

    // Apply the toolbar facet filters once; every view — minimal and calendar —
    // sees the same set and resolves its own date range from it.
    const filteredAppointments = useMemo(
        () => filterAppointments(localAppointments, filters),
        [localAppointments, filters],
    );

    const cursorKey = dateKey(cursor);

    // The minimal view is now day-based: show only the appointments on the day
    // the switcher points at. The calendar views slice by date themselves.
    const dayAppointments = useMemo(
        () =>
            filteredAppointments.filter(
                (appointment) =>
                    appointmentDateKey(appointment, timezone) === cursorKey,
            ),
        [filteredAppointments, timezone, cursorKey],
    );

    const { dayColumns, workingHoursLoading } = useDayColumns({
        view,
        cursorKey,
        specialists,
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
        if (blockWhenOffline()) {
            return;
        }

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

        if (blockWhenOffline()) {
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
        if (blockWhenOffline()) {
            return;
        }

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
        if (blockWhenOffline()) {
            return;
        }

        const specialist = specialists.find((item) => item.id === specialistId);

        if (!specialist) {
            return;
        }

        setDayEditing(null);
        setDaySpecialist(specialist);
        setDayStartIso(startIso);
        setDayFormOpen(true);
    };

    const handleReschedule = (appointment: Appointment, startIso: string) => {
        if (blockWhenOffline()) {
            return;
        }

        reschedule(appointment, startIso);
    };

    const hasBookableResources = services.length > 0 && specialists.length > 0;

    // No writes offline: the create affordances are disabled outright rather
    // than firing a toast, since there is nothing to create against offline.
    const canCreate = hasBookableResources && isOnline;

    // Mobile: the inline "Today" button is hidden; it reappears as a bottom-left
    // FAB only when the viewed period isn't the current one for the active view.
    const isViewingToday = useMemo(() => {
        const now = new Date();

        if (view === 'week') {
            return dateKey(weekDays(cursor)[0]) === dateKey(weekDays(now)[0]);
        }

        if (view === 'month') {
            return (
                cursor.getFullYear() === now.getFullYear() &&
                cursor.getMonth() === now.getMonth()
            );
        }

        return dateKey(cursor) === dateKey(now);
    }, [view, cursor]);

    // Label for the "jump to today" FAB: the current day-of-month and short
    // month, so the button reads as a date rather than a generic icon.
    const todayLabel = useMemo(() => {
        const now = new Date();

        return {
            day: now.getDate(),
            month: new Intl.DateTimeFormat(undefined, {
                month: 'short',
            }).format(now),
        };
    }, []);

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
                    view={view}
                    onViewChange={setView}
                    onCreate={openCreate}
                    canCreate={canCreate}
                    showLocation={showLocation}
                    showSpecialist={showSpecialist}
                />

                {view === 'minimal' ? (
                    <div className="space-y-4">
                        <CalendarDateNav
                            view="day"
                            date={cursor}
                            onDateChange={setCursor}
                        />
                        <AppointmentsTable
                            appointments={dayAppointments}
                            onView={openDetails}
                            onEdit={openEdit}
                            onCancel={confirmCancel}
                            onViewCustomer={openCustomer}
                            canModify={(appointment) =>
                                !isPastAppointment(appointment)
                            }
                            showLocation={showLocation}
                            showSpecialist={showSpecialist}
                            groupByDay={false}
                            emptyMessage={t('empty.day')}
                        />
                    </div>
                ) : (
                    <AppointmentCalendar
                        view={view}
                        date={cursor}
                        onDateChange={setCursor}
                        onViewChange={setView}
                        appointments={filteredAppointments}
                        timezone={timezone}
                        dayColumns={dayColumns}
                        workingHoursLoading={workingHoursLoading}
                        onSelectAppointment={openDetails}
                        onReschedule={handleReschedule}
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
                disabled={!canCreate}
                onClick={openCreate}
            >
                <CalendarPlus className="size-6" />
            </button>

            {/* Mobile: jump back to today. Mirrors the create FAB on the opposite
                side (same line/height), shown in any day-navigable view when the
                viewed period isn't already the current one. It shows today's date
                so its purpose is obvious — the calendar icon is now the date
                picker in the nav, and reusing it here would be confusing. */}
            {!isViewingToday && (
                <button
                    type="button"
                    className="fixed bottom-[calc(4rem+1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-50 flex size-14 flex-col items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:hidden"
                    data-test="calendar-today-fab"
                    aria-label={t('toolbar.calendar.today')}
                    onClick={() => setCursor(new Date())}
                >
                    <span className="text-lg leading-none font-semibold">
                        {todayLabel.day}
                    </span>
                    <span className="text-[10px] leading-tight font-medium tracking-wide uppercase">
                        {todayLabel.month}
                    </span>
                </button>
            )}

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

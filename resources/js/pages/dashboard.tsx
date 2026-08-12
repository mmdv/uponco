import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppointmentDetailsModal from '@/components/appointments/appointment-details-modal';
import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import CancelAppointmentModal from '@/components/appointments/cancel-appointment-modal';
import BookingShareCard from '@/components/dashboard/booking-share-card';
import BookingsChart from '@/components/dashboard/bookings-chart';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import ManageCompanyCard from '@/components/dashboard/manage-company-card';
import QuickActions from '@/components/dashboard/quick-actions';
import QuickCreateForms from '@/components/dashboard/quick-create-forms';
import type { QuickCreateForm } from '@/components/dashboard/quick-create-forms';
import ScheduleCard from '@/components/dashboard/schedule-card';
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { toDateInputValue } from '@/lib/appointments';
import { dashboard } from '@/routes';
import { cancel as cancelRoute } from '@/routes/appointments';
import type {
    Appointment,
    AppointmentSlot,
    DashboardFormOptions,
    DashboardStats as Stats,
    DashboardTrendDay,
    ScheduleSummary,
    UpcomingAppointment,
} from '@/types';

type Props = {
    timezone: string;
    stats: Stats | null;
    weeklyTrend: DashboardTrendDay[] | null;
    upcomingAppointments: UpcomingAppointment[] | null;
    formOptions: DashboardFormOptions | null;
    schedule: ScheduleSummary | null;
    availableSlots?: AppointmentSlot[];
};

const EMPTY_STATS: Stats = {
    customers: 0,
    totalBookings: 0,
    upcoming: 0,
    services: 0,
    locations: 0,
};

export default function Dashboard({
    timezone,
    stats,
    weeklyTrend,
    upcomingAppointments,
    formOptions,
    schedule,
    availableSlots = [],
}: Props) {
    const { t } = useTranslation('dashboard');
    const { auth, currentTeam } = usePage().props;
    const companyName = currentTeam?.name ?? '';
    const firstName = auth.user.name.split(' ')[0];
    const isMobile = useIsMobile();

    // Admins and owners may edit any appointment; members only the ones where
    // they are the assigned specialist. Mirrors the backend authorization.
    const isTeamAdmin =
        currentTeam?.role === 'admin' || currentTeam?.role === 'owner';
    const canEditAppointment = (appointment: UpcomingAppointment) =>
        isTeamAdmin || appointment.specialist_id === auth.user.id;

    const [openForm, setOpenForm] = useState<QuickCreateForm | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [viewingAppointment, setViewingAppointment] =
        useState<UpcomingAppointment | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] =
        useState<UpcomingAppointment | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [cancellingAppointment, setCancellingAppointment] =
        useState<UpcomingAppointment | null>(null);
    const [cancelOpen, setCancelOpen] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    const openEditAppointment = (appointment: UpcomingAppointment) => {
        setDetailsOpen(false);
        setEditingAppointment(appointment);
        setEditOpen(true);

        requestSlots({
            serviceId: appointment.service_id,
            specialistId: appointment.specialist_id,
            date: toDateInputValue(appointment.start_at, timezone),
            appointmentId: appointment.id,
        });
    };

    const confirmCancelAppointment = (appointment: UpcomingAppointment) => {
        setCancellingAppointment(appointment);
        setCancelOpen(true);
    };

    const [cancelProcessing, setCancelProcessing] = useState(false);

    const cancelAppointment = (appointment: Appointment) => {
        router.visit(cancelRoute([appointment.id]), {
            preserveScroll: true,
            onStart: () => setCancelProcessing(true),
            onFinish: () => setCancelProcessing(false),
            onSuccess: () => {
                setCancelOpen(false);
                setEditOpen(false);
            },
        });
    };

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

    const safeStats = stats ?? EMPTY_STATS;
    const trend = weeklyTrend ?? [];
    const upcoming = upcomingAppointments ?? [];

    /*
        Two cards that swap column depending on the viewport: on a phone they
        tail the single column, keeping the appointments and figures — what an
        owner opens the dashboard for — above the fold. On desktop they head
        the right rail. Declared once and rendered in exactly one branch below.
    */
    const bookingShareCard = (
        <BookingShareCard
            companyName={companyName}
            onAddAppointment={() => setOpenForm('appointment')}
        />
    );
    /*
        Admins and owners manage the whole company from here; members instead
        get a preview of their own availability that links to their schedule.
    */
    const companyCard =
        isTeamAdmin || !schedule ? (
            <ManageCompanyCard />
        ) : (
            <ScheduleCard schedule={schedule} />
        );

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <DashboardHeader firstName={firstName} />

                {/*
                    Desktop: a 2/3 left column stacking upcoming appointments,
                    the week ahead and the stats, beside a 1/3 right rail
                    holding the booking link and the company hub. Mobile: a
                    single column, with those two lifted out of the rail and
                    appended below the stats.
                */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex min-w-0 flex-col gap-6 lg:col-span-2 lg:col-start-1 lg:row-start-1">
                        <UpcomingAppointments
                            appointments={upcoming}
                            onAddAppointment={() => setOpenForm('appointment')}
                            onView={(appointment) => {
                                setViewingAppointment(appointment);
                                setDetailsOpen(true);
                            }}
                        />

                        {trend.length > 0 && (
                            <BookingsChart trend={trend} mounted={mounted} />
                        )}

                        <DashboardStats stats={safeStats} mounted={mounted} />

                        {isMobile && companyCard}

                        {isMobile && bookingShareCard}
                    </div>

                    {!isMobile && (
                        <div className="flex min-w-0 flex-col gap-6 lg:col-start-3 lg:row-start-1 lg:self-start">
                            {bookingShareCard}
                            {companyCard}
                        </div>
                    )}
                </div>
            </div>

            <QuickActions
                onAddAppointment={() => setOpenForm('appointment')}
                onAddCustomer={() => setOpenForm('customer')}
                onAddService={() => setOpenForm('service')}
                onAddLocation={() => setOpenForm('location')}
            />

            <AppointmentDetailsModal
                appointment={viewingAppointment}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                canEdit={
                    viewingAppointment
                        ? canEditAppointment(viewingAppointment)
                        : false
                }
                onEdit={openEditAppointment}
            />

            {formOptions && (
                <AppointmentFormDrawer
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    appointment={editingAppointment}
                    timezone={timezone}
                    services={formOptions.appointments.services}
                    locations={formOptions.appointments.locations}
                    specialists={formOptions.appointments.specialists}
                    availableSlots={availableSlots}
                    slotsLoading={slotsLoading}
                    onRequestSlots={requestSlots}
                    onCancelAppointment={confirmCancelAppointment}
                />
            )}

            <CancelAppointmentModal
                appointment={cancellingAppointment}
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                processing={cancelProcessing}
                onConfirm={cancelAppointment}
            />

            {formOptions && (
                <QuickCreateForms
                    open={openForm}
                    onOpenChange={(form, open) =>
                        setOpenForm(open ? form : null)
                    }
                    options={formOptions}
                    timezone={timezone}
                    availableSlots={availableSlots}
                    slotsLoading={slotsLoading}
                    onRequestSlots={requestSlots}
                />
            )}
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard() : '/',
        },
    ],
});

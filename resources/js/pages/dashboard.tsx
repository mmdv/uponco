import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import AppointmentDetailsModal from '@/components/appointments/appointment-details-modal';
import AppointmentFormDrawer from '@/components/appointments/appointment-form-drawer';
import type { SlotRequest } from '@/components/appointments/appointment-form-drawer';
import BookingsChart from '@/components/dashboard/bookings-chart';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import DashboardStats from '@/components/dashboard/dashboard-stats';
import QuickActions from '@/components/dashboard/quick-actions';
import QuickCreateForms from '@/components/dashboard/quick-create-forms';
import type { QuickCreateForm } from '@/components/dashboard/quick-create-forms';
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments';
import OnboardingWizard from '@/components/onboarding/onboarding-wizard';
import { toDateInputValue } from '@/lib/appointments';
import { dashboard } from '@/routes';
import type {
    AppointmentSlot,
    DashboardFormOptions,
    DashboardStats as Stats,
    DashboardTrendDay,
    Onboarding,
    UpcomingAppointment,
} from '@/types';

type Props = {
    onboarding: Onboarding | null;
    timezone: string;
    stats: Stats | null;
    weeklyTrend: DashboardTrendDay[] | null;
    upcomingAppointments: UpcomingAppointment[] | null;
    formOptions: DashboardFormOptions | null;
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
    onboarding,
    timezone,
    stats,
    weeklyTrend,
    upcomingAppointments,
    formOptions,
    availableSlots = [],
}: Props) {
    const { auth, currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const firstName = auth.user.name.split(' ')[0];

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

    if (onboarding) {
        return (
            <>
                <Head title="Dashboard" />
                <OnboardingWizard onboarding={onboarding} />
            </>
        );
    }

    const safeStats = stats ?? EMPTY_STATS;
    const trend = weeklyTrend ?? [];
    const upcoming = upcomingAppointments ?? [];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <DashboardHeader
                    firstName={firstName}
                    teamSlug={teamSlug}
                    onAddAppointment={() => setOpenForm('appointment')}
                />

                {/*
                    Desktop: a 2/3 left column (the week ahead + stats stacked)
                    beside a 1/3 right rail holding the upcoming appointments,
                    which spans both rows so it reads as a tall portrait card.
                    Mobile: a single column reordered to Upcoming → Week ahead →
                    Stats.
                */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {trend.length > 0 && (
                        <div className="order-2 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-1">
                            <BookingsChart trend={trend} mounted={mounted} />
                        </div>
                    )}

                    <div className="order-3 lg:order-none lg:col-span-2 lg:col-start-1 lg:row-start-2">
                        <DashboardStats
                            stats={safeStats}
                            teamSlug={teamSlug}
                            mounted={mounted}
                        />
                    </div>

                    <div className="order-1 lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1">
                        <UpcomingAppointments
                            appointments={upcoming}
                            teamSlug={teamSlug}
                            onAddAppointment={() => setOpenForm('appointment')}
                            onView={(appointment) => {
                                setViewingAppointment(appointment);
                                setDetailsOpen(true);
                            }}
                        />
                    </div>
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
                    teamSlug={teamSlug}
                    timezone={timezone}
                    services={formOptions.appointments.services}
                    locations={formOptions.appointments.locations}
                    specialists={formOptions.appointments.specialists}
                    availableSlots={availableSlots}
                    slotsLoading={slotsLoading}
                    onRequestSlots={requestSlots}
                />
            )}

            {formOptions && (
                <QuickCreateForms
                    open={openForm}
                    onOpenChange={(form, open) =>
                        setOpenForm(open ? form : null)
                    }
                    options={formOptions}
                    teamSlug={teamSlug}
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
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});

import { Clock, MapPin } from 'lucide-react';
import {
    AppContent,
    AppShell,
    AppSidebar,
    AppSidebarHeader,
    Badge,
    Button,
    TooltipProvider,
} from 'uponco';

const appointments = [
    {
        time: '09:00',
        service: 'Gel Manicure',
        specialist: 'Səbinə Quliyeva',
        status: 'Confirmed',
    },
    {
        time: '10:30',
        service: 'Deep Tissue Massage',
        specialist: 'Leyla Hüseynova',
        status: 'Pending',
    },
    {
        time: '13:00',
        service: 'Swedish Massage',
        specialist: 'Leyla Hüseynova',
        status: 'Confirmed',
    },
];

function AppointmentsList() {
    return (
        <div className="divide-y rounded-xl border bg-card">
            {appointments.map((appointment) => (
                <div
                    key={appointment.time}
                    className="flex items-center gap-4 p-4"
                >
                    <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                        <Clock className="size-4 text-muted-foreground" />
                        {appointment.time}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {appointment.service}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {appointment.specialist} · Nizami Studio
                        </p>
                    </div>
                    <Badge
                        variant={
                            appointment.status === 'Pending'
                                ? 'secondary'
                                : 'outline'
                        }
                    >
                        {appointment.status}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

/**
 * The `sidebar` variant renders a `SidebarInset`, so the page area sits in the
 * rounded, offset panel next to the docked sidebar.
 */
export function SidebarInsetPage() {
    return (
        <TooltipProvider>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader
                        breadcrumbs={[
                            { title: 'Appointments', href: '/appointments' },
                        ]}
                    />
                    <div className="flex flex-col gap-4 p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">Today</h1>
                            <Button size="sm" variant="outline">
                                Week view
                            </Button>
                        </div>
                        <AppointmentsList />
                    </div>
                </AppContent>
            </AppShell>
        </TooltipProvider>
    );
}

/**
 * The `header` variant is a plain centred `<main>` capped at `max-w-7xl`, used
 * under the top-navigation layout.
 */
export function CentredMainColumn() {
    return (
        <div
            className="flex w-full flex-col bg-background"
            style={{ height: 640 }}
        >
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6 text-sm font-medium">
                <MapPin className="size-4 text-primary" />
                Nizami Studio · Baku
            </header>
            <AppContent variant="header" className="gap-4 p-6">
                <h1 className="text-xl font-semibold">Appointments</h1>
                <AppointmentsList />
            </AppContent>
        </div>
    );
}

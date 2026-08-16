import { CalendarDays, Plus } from 'lucide-react';
import {
    AppContent,
    AppShell,
    AppSidebar,
    AppSidebarHeader,
    Badge,
    Button,
    TooltipProvider,
} from 'uponco';

function DashboardBody() {
    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Lumen Studio · Baku
                    </p>
                </div>
                <Button size="sm">
                    <Plus className="size-4" />
                    New appointment
                </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Today', value: '8' },
                    { label: 'This week', value: '47' },
                    { label: 'Customers', value: '312' },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border bg-card p-4"
                    >
                        <p className="text-xs text-muted-foreground">
                            {stat.label}
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
            <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Next up</p>
                    <Badge variant="secondary">3 pending</Badge>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    10:30 · Deep Tissue Massage · Leyla Hüseynova
                </p>
            </div>
        </div>
    );
}

/**
 * `variant="sidebar"` (the default) wraps children in a `SidebarProvider`, so
 * the real `AppSidebar` docks beside the page — this is the layout every
 * signed-in page uses.
 */
export function SidebarVariant() {
    return (
        <TooltipProvider>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader
                        breadcrumbs={[
                            { title: 'Dashboard', href: '/dashboard' },
                        ]}
                    />
                    <DashboardBody />
                </AppContent>
            </AppShell>
        </TooltipProvider>
    );
}

/**
 * `variant="header"` drops the sidebar provider entirely and just stacks the
 * page vertically — the shell used by the top-navigation layout.
 */
export function HeaderVariant() {
    return (
        <AppShell variant="header">
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                        L
                    </span>
                    <span className="text-sm font-semibold">Lumen Studio</span>
                </div>
                <Button variant="outline" size="sm">
                    Appointments
                </Button>
            </header>
            <AppContent variant="header">
                <DashboardBody />
            </AppContent>
        </AppShell>
    );
}

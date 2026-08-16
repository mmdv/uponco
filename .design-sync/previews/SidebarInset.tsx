import {
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from 'uponco';

const nav = [
    { title: 'Dashboard', icon: LayoutGrid, active: true },
    { title: 'Manage', icon: SlidersHorizontal, active: false },
    { title: 'Schedule', icon: CalendarClock, active: false },
    { title: 'My Schedule', icon: CalendarRange, active: false },
];

function AuroraSidebar({ variant }: { variant?: 'sidebar' | 'inset' }) {
    return (
        <Sidebar collapsible="icon" variant={variant}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <CalendarClock />
                            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium">
                                    Aurora Beauty Studio
                                </span>
                                <span className="truncate text-xs text-sidebar-foreground/70">
                                    Owner · Baku
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {nav.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton isActive={item.active}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Users />
                            <span>Leyla Mammadova</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export function InsetVariant() {
    return (
        <SidebarProvider>
            <AuroraSidebar variant="inset" />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <span className="text-sm font-medium">
                        Today · Tuesday 19 August
                    </span>
                </header>
                <div className="p-4">
                    <div className="divide-y rounded-xl border">
                        <div className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Deep Tissue Massage
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    11:30 · Leyla Mammadova
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                ₼85
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Gel Manicure
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    13:00 · Nigar Aliyeva
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                ₼40
                            </span>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function FlushAgainstSidebar() {
    return (
        <SidebarProvider>
            <AuroraSidebar />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <span className="text-sm font-medium">Customers</span>
                </header>
                <div className="p-4">
                    <div className="divide-y rounded-xl border">
                        <div className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Nigar Aliyeva
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    nigar@example.az
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                6 bookings
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Kamran Hasanov
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    kamran@example.az
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                2 bookings
                            </span>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

import {
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    MapPin,
    Scissors,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from 'uponco';

function SidebarShell({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider className="min-h-0 w-auto">
            <Sidebar collapsible="none" className="h-auto rounded-lg border">
                <SidebarHeader className="px-4 py-3">
                    <span className="text-sm font-semibold">
                        Aurora Beauty Studio
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Baku · Nizami
                    </span>
                </SidebarHeader>
                <SidebarContent>{children}</SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}

export function MenuContent() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarClock />
                                <span>Schedule</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarRange />
                                <span>My Schedule</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function SummaryContent() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Today at a glance</SidebarGroupLabel>
                <SidebarGroupContent className="px-2 py-1">
                    <dl className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <dt className="text-sidebar-foreground/70">
                                Booked
                            </dt>
                            <dd className="font-medium tabular-nums">12</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-sidebar-foreground/70">
                                Free slots
                            </dt>
                            <dd className="font-medium tabular-nums">5</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-sidebar-foreground/70">
                                Revenue
                            </dt>
                            <dd className="font-medium tabular-nums">840 ₼</dd>
                        </div>
                    </dl>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Company</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Scissors />
                                <span>Services</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <MapPin />
                                <span>Locations</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

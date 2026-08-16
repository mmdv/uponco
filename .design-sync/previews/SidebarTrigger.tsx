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

function Workspace({ title }: { title: string }) {
    return (
        <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <span className="text-sm font-medium">{title}</span>
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
                        <span className="text-xs text-muted-foreground">₼85</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div>
                            <p className="text-sm font-medium">Gel Manicure</p>
                            <p className="text-xs text-muted-foreground">
                                13:00 · Nigar Aliyeva
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground">₼40</span>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
export function CloseAffordance() {
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" variant="inset">
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
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <SlidersHorizontal />
                                <span>Manage</span>
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
            <Workspace title="Dashboard" />
        </SidebarProvider>
    );
}

export function OpenAffordance() {
    return (
        <SidebarProvider open={false}>
            <Sidebar collapsible="icon" variant="inset">
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
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <LayoutGrid />
                                <span>Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <SlidersHorizontal />
                                <span>Manage</span>
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
            <Workspace title="Dashboard" />
        </SidebarProvider>
    );
}

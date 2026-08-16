import {
    Bell,
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    Users,
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
    SidebarMenuBadge,
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

export function CountBadges() {
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
                            <SidebarMenuBadge>12</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarRange />
                                <span>My Schedule</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>3</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Bell />
                                <span>Notifications</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>24</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function BadgeOnActiveAndSmallRows() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Today</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <Users />
                                <span>Leyla Hüseynova</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>6</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="sm">
                                <Users />
                                <span>Səbinə Quliyeva</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>4</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="sm">
                                <Users />
                                <span>Kamran Əsgərov</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>0</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

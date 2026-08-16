import {
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    MoreHorizontal,
    Scissors,
    SlidersHorizontal,
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
    SidebarMenuAction,
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

export function NavItems() {
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
                                <SlidersHorizontal />
                                <span>Manage</span>
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

export function ItemsWithActionAndBadge() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Services</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <Scissors />
                                <span>Deep Tissue Massage</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction aria-label="More options for Deep Tissue Massage">
                                <MoreHorizontal />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Scissors />
                                <span>Gel Manicure</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction aria-label="More options for Gel Manicure">
                                <MoreHorizontal />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarClock />
                                <span>Waiting list</span>
                            </SidebarMenuButton>
                            <SidebarMenuBadge>7</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

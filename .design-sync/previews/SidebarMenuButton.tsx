import {
    BookOpen,
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    ShieldCheck,
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

export function PlatformNav() {
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
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <ShieldCheck />
                                <span>Backoffice</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function Sizes() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Sizes</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <CalendarClock />
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-medium">
                                        Aurora Beauty Studio
                                    </span>
                                    <span className="truncate text-xs text-sidebar-foreground/70">
                                        Owner · 3 locations
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <LayoutGrid />
                                <span>Dashboard (default)</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="sm">
                                <BookOpen />
                                <span>Documentation (sm)</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function VariantsAndStates() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>States</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <LayoutGrid />
                                <span>Active — Dashboard</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <CalendarClock />
                                <span>Default — Schedule</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton variant="outline">
                                <CalendarRange />
                                <span>Outline — My Schedule</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled>
                                <ShieldCheck />
                                <span>Disabled — Backoffice</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

import { MapPin, Plus, Scissors, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
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

export function AddServiceAction() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Services</SidebarGroupLabel>
                <SidebarGroupAction aria-label="Add a service">
                    <Plus />
                </SidebarGroupAction>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive>
                                <Scissors />
                                <span>Deep Tissue Massage</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Scissors />
                                <span>Gel Manicure</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Scissors />
                                <span>Beard Trim</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function ActionPerGroup() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Locations</SidebarGroupLabel>
                <SidebarGroupAction aria-label="Add a location">
                    <Plus />
                </SidebarGroupAction>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <MapPin />
                                <span>Nizami Studio</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <MapPin />
                                <span>Port Baku Kiosk</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Specialists</SidebarGroupLabel>
                <SidebarGroupAction aria-label="Invite a specialist">
                    <Plus />
                </SidebarGroupAction>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Users />
                                <span>Leyla Hüseynova</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Users />
                                <span>Səbinə Quliyeva</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

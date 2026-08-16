import { MapPin, MoreHorizontal, Plus, Scissors } from 'lucide-react';
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

export function ServiceRowActions() {
    const services = [
        'Deep Tissue Massage',
        'Swedish Massage',
        'Gel Manicure',
        'Beard Trim',
    ];

    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Services</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {services.map((service, index) => (
                            <SidebarMenuItem key={service}>
                                <SidebarMenuButton isActive={index === 0}>
                                    <Scissors />
                                    <span>{service}</span>
                                </SidebarMenuButton>
                                <SidebarMenuAction
                                    aria-label={`More options for ${service}`}
                                >
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

export function AddAndMoreActions() {
    return (
        <SidebarShell>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Locations</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <MapPin />
                                <span>Nizami Studio</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction aria-label="Add a room to Nizami Studio">
                                <Plus />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <MapPin />
                                <span>Port Baku Kiosk</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction aria-label="More options for Port Baku Kiosk">
                                <MoreHorizontal />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="sm">
                                <MapPin />
                                <span>White City Room 2</span>
                            </SidebarMenuButton>
                            <SidebarMenuAction aria-label="More options for White City Room 2">
                                <MoreHorizontal />
                            </SidebarMenuAction>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarShell>
    );
}

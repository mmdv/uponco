import {
    CalendarClock,
    CalendarRange,
    LayoutGrid,
    Scissors,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
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

function Shell({
    variant,
    side,
}: {
    variant?: 'sidebar' | 'floating' | 'inset';
    side?: 'left' | 'right';
}) {
    return (
        <SidebarProvider>
            {side === 'right' ? <Content variant={variant} /> : null}
            <Sidebar collapsible="icon" variant={variant} side={side}>
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
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nav.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            isActive={item.active}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
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
            {side === 'right' ? null : <Content variant={variant} />}
        </SidebarProvider>
    );
}

function Content({ variant }: { variant?: string }) {
    return (
        <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <span className="text-sm font-medium">
                    Services · {variant ?? 'sidebar'} variant
                </span>
            </header>
            <div className="p-4">
                <div className="divide-y rounded-xl border">
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3">
                            <Scissors className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Deep Tissue Massage
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            60 min · ₼85
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3">
                            <Scissors className="size-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Gel Manicure</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            45 min · ₼40
                        </span>
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}

export function DefaultVariant() {
    return <Shell />;
}

export function InsetVariant() {
    return <Shell variant="inset" />;
}

export function FloatingVariant() {
    return <Shell variant="floating" />;
}

export function RightSide() {
    return <Shell variant="inset" side="right" />;
}

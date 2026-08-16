import { Building2, CalendarDays, LayoutGrid, Users } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from 'uponco';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Appointments', href: '/appointments', icon: CalendarDays },
    { title: 'Customers', href: '/customers', icon: Users },
    { title: 'Company', href: '/company', icon: Building2 },
];

/**
 * `NavigationMenuItem` needs its list and root for context, so the preview is
 * the app header's desktop nav — one item per top-level section, the current
 * page carrying the active pill.
 */
export function LinkItems() {
    return (
        <NavigationMenu className="flex h-full items-stretch">
            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {navItems.map((item) => (
                    <NavigationMenuItem
                        key={item.href}
                        className="relative flex h-full items-center"
                    >
                        <a
                            href={item.href}
                            data-active={item.title === 'Customers'}
                            className={`${navigationMenuTriggerStyle()} h-10 cursor-pointer rounded-full bg-transparent px-4`}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                        </a>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

/** An item that owns a panel, shown open beside a plain sibling item. */
export function ItemWithPanel() {
    return (
        <div className="pb-40">
            <NavigationMenu value="company" viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-60 gap-1 p-2">
                                <li>
                                    <NavigationMenuLink href="/company/services">
                                        <span className="font-medium">
                                            Services
                                        </span>
                                        <span className="text-muted-foreground">
                                            Prices and durations
                                        </span>
                                    </NavigationMenuLink>
                                </li>
                                <li>
                                    <NavigationMenuLink href="/company/specialists">
                                        <span className="font-medium">
                                            Specialists
                                        </span>
                                        <span className="text-muted-foreground">
                                            Who works on what
                                        </span>
                                    </NavigationMenuLink>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem value="schedule">
                        <NavigationMenuTrigger>Schedule</NavigationMenuTrigger>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

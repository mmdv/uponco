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

/** The app header's desktop navigation, with Appointments as the current page. */
export function HeaderNav() {
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
                            data-active={item.title === 'Appointments'}
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

/**
 * A trigger with its panel open — the company section grouping everything an
 * owner manages. Rendered without the viewport so the panel sits in flow.
 */
export function WithOpenDropdown() {
    return (
        <div className="pb-44">
            <NavigationMenu value="company" viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-64 gap-1 p-2">
                                <li>
                                    <NavigationMenuLink href="/company/services">
                                        <span className="font-medium">
                                            Services
                                        </span>
                                        <span className="text-muted-foreground">
                                            Prices, durations and categories
                                        </span>
                                    </NavigationMenuLink>
                                </li>
                                <li>
                                    <NavigationMenuLink href="/company/specialists">
                                        <span className="font-medium">
                                            Specialists
                                        </span>
                                        <span className="text-muted-foreground">
                                            Who works on what, and when
                                        </span>
                                    </NavigationMenuLink>
                                </li>
                                <li>
                                    <NavigationMenuLink href="/company/locations">
                                        <span className="font-medium">
                                            Locations
                                        </span>
                                        <span className="text-muted-foreground">
                                            Studios customers can book at
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

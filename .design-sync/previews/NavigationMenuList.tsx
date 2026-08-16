import { Building2, CalendarDays, LayoutGrid, Users } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from 'uponco';

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Appointments', href: '/appointments', icon: CalendarDays },
    { title: 'Customers', href: '/customers', icon: Users },
    { title: 'Company', href: '/company', icon: Building2 },
];

/**
 * `NavigationMenuList` only renders inside a `NavigationMenu`, so the preview is
 * the app header's full desktop nav.
 */
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

/** A member's shorter list — they only see their own schedule and bookings. */
export function MemberNav() {
    return (
        <NavigationMenu className="flex h-full items-stretch">
            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {navItems.slice(0, 2).map((item) => (
                    <NavigationMenuItem
                        key={item.href}
                        className="relative flex h-full items-center"
                    >
                        <a
                            href={item.href}
                            data-active={item.title === 'Dashboard'}
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

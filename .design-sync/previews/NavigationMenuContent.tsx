import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from 'uponco';

const companyLinks = [
    {
        href: '/company/services',
        title: 'Services',
        hint: 'Prices, durations and categories',
    },
    {
        href: '/company/specialists',
        title: 'Specialists',
        hint: 'Who works on what, and when',
    },
    {
        href: '/company/locations',
        title: 'Locations',
        hint: 'Studios customers can book at',
    },
];

const bookingLinks = [
    {
        href: '/appointments',
        title: "Today's schedule",
        hint: '12 appointments at Nizami Studio',
    },
    {
        href: '/appointments?filter=upcoming',
        title: 'Upcoming',
        hint: '54 booked over the next 7 days',
    },
];

/**
 * `NavigationMenuContent` only mounts while its item is open, so the preview
 * pins the menu open on the Company item.
 */
export function CompanyPanel() {
    return (
        <div className="pb-52">
            <NavigationMenu value="company" viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-64 gap-1 p-2">
                                {companyLinks.map((link) => (
                                    <li key={link.href}>
                                        <NavigationMenuLink href={link.href}>
                                            <span className="font-medium">
                                                {link.title}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {link.hint}
                                            </span>
                                        </NavigationMenuLink>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

/**
 * A second, wider panel on a different item — the content sizes the popover, so
 * each section can be as wide as it needs.
 */
export function BookingsPanel() {
    return (
        <div className="pb-52">
            <NavigationMenu value="bookings" viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem value="bookings">
                        <NavigationMenuTrigger>Bookings</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-80 gap-1 p-2">
                                {bookingLinks.map((link) => (
                                    <li key={link.href}>
                                        <NavigationMenuLink href={link.href}>
                                            <span className="font-medium">
                                                {link.title}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {link.hint}
                                            </span>
                                        </NavigationMenuLink>
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

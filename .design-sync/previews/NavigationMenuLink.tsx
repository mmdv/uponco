import { MapPin, Scissors, Users } from 'lucide-react';
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
        icon: Scissors,
        title: 'Services',
        hint: 'Prices, durations and categories',
    },
    {
        href: '/company/specialists',
        icon: Users,
        title: 'Specialists',
        hint: 'Who works on what, and when',
    },
    {
        href: '/company/locations',
        icon: MapPin,
        title: 'Locations',
        hint: 'Studios customers can book at',
    },
];

/**
 * The links inside an open Company panel. `NavigationMenuLink` needs its menu
 * for context, so the whole menu is pinned open.
 */
export function InsidePanel() {
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
                                        <NavigationMenuLink
                                            href={link.href}
                                            active={
                                                link.title === 'Specialists'
                                            }
                                        >
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

/** With a leading icon, which the link tints muted unless told otherwise. */
export function WithIcons() {
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
                                            <link.icon />
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

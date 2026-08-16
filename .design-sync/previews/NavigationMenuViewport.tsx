import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from 'uponco';

function CompanyPanel() {
    return (
        <ul className="grid w-64 gap-1 p-2">
            <li>
                <NavigationMenuLink href="/company/services">
                    <span className="font-medium">Services</span>
                    <span className="text-muted-foreground">
                        Prices, durations and categories
                    </span>
                </NavigationMenuLink>
            </li>
            <li>
                <NavigationMenuLink href="/company/specialists">
                    <span className="font-medium">Specialists</span>
                    <span className="text-muted-foreground">
                        Who works on what, and when
                    </span>
                </NavigationMenuLink>
            </li>
        </ul>
    );
}

function SchedulePanel() {
    return (
        <ul className="grid w-72 gap-1 p-2">
            <li>
                <NavigationMenuLink href="/schedule">
                    <span className="font-medium">Team schedule</span>
                    <span className="text-muted-foreground">
                        Working hours for every specialist
                    </span>
                </NavigationMenuLink>
            </li>
            <li>
                <NavigationMenuLink href="/schedule/me">
                    <span className="font-medium">My hours</span>
                    <span className="text-muted-foreground">
                        Mon–Fri, 09:00–18:00 at Nizami Studio
                    </span>
                </NavigationMenuLink>
            </li>
        </ul>
    );
}

/**
 * The viewport is what animates and resizes around whichever panel is open. It
 * is rendered by `NavigationMenu` itself, so the preview pins the menu open on
 * the Company item.
 */
export function HostingCompanyPanel() {
    return (
        <div className="pb-48">
            <NavigationMenu value="company">
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <CompanyPanel />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem value="schedule">
                        <NavigationMenuTrigger>Schedule</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <SchedulePanel />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

/**
 * The same menu with the Schedule item open — the viewport takes that panel's
 * width instead, which is the whole point of the component.
 */
export function ResizedToSchedulePanel() {
    return (
        <div className="pb-48">
            <NavigationMenu value="schedule">
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <CompanyPanel />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem value="schedule">
                        <NavigationMenuTrigger>Schedule</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <SchedulePanel />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

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
        <ul className="grid w-60 gap-1 p-2">
            <li>
                <NavigationMenuLink href="/company/services">
                    <span className="font-medium">Services</span>
                    <span className="text-muted-foreground">
                        Prices, durations and categories
                    </span>
                </NavigationMenuLink>
            </li>
            <li>
                <NavigationMenuLink href="/company/locations">
                    <span className="font-medium">Locations</span>
                    <span className="text-muted-foreground">
                        Studios customers can book at
                    </span>
                </NavigationMenuLink>
            </li>
        </ul>
    );
}

/**
 * Closed triggers: the chevron points down and the pill sits flat. Rendered in
 * a full `NavigationMenu`, which the trigger needs for context.
 */
export function Closed() {
    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                <NavigationMenuItem value="company">
                    <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <CompanyPanel />
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="schedule">
                    <NavigationMenuTrigger>Schedule</NavigationMenuTrigger>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

/** Open: the trigger takes the accent wash and its chevron flips. */
export function Open() {
    return (
        <div className="pb-36">
            <NavigationMenu value="company" viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem value="company">
                        <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <CompanyPanel />
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

/** A section the signed-in member cannot reach is disabled rather than hidden. */
export function Disabled() {
    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                <NavigationMenuItem value="schedule">
                    <NavigationMenuTrigger>Schedule</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem value="billing">
                    <NavigationMenuTrigger disabled>
                        Billing
                    </NavigationMenuTrigger>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

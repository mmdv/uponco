import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
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
        <ul className="grid w-64 gap-1 p-2">
            <li>
                <NavigationMenuLink href="/schedule">
                    <span className="font-medium">Team schedule</span>
                    <span className="text-muted-foreground">
                        Working hours for every specialist
                    </span>
                </NavigationMenuLink>
            </li>
        </ul>
    );
}

/**
 * The little arrow that points from the open trigger up at its panel. It lives
 * in the list and only shows while a menu is open, so the preview pins one.
 */
export function PointingAtCompany() {
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
                    <NavigationMenuIndicator />
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}

/**
 * With no menu open the indicator is hidden, leaving the trigger row flat —
 * the other half of its only state axis.
 */
export function HiddenWhenClosed() {
    return (
        <NavigationMenu>
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
                <NavigationMenuIndicator />
            </NavigationMenuList>
        </NavigationMenu>
    );
}

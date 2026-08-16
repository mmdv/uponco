import { CalendarDays, CalendarRange, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from 'uponco';

/**
 * The tint the app puts on the selected segment — grey reads as barely
 * distinct from hover, so every segmented control in the product repeats this.
 */
const SELECTED =
    'data-[state=on]:bg-primary/10 data-[state=on]:font-medium data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary';

export function ViewSwitcher() {
    return (
        <ToggleGroup type="single" variant="outline" value="week">
            <ToggleGroupItem value="week" className={SELECTED}>
                Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className={SELECTED}>
                Month
            </ToggleGroupItem>
            <ToggleGroupItem value="team" className={SELECTED}>
                Team
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

export function WithIcons() {
    return (
        <ToggleGroup type="single" variant="outline" value="day">
            <ToggleGroupItem value="minimal" aria-label="List view" className={SELECTED}>
                <List className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day view" className={SELECTED}>
                <CalendarDays className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view" className={SELECTED}>
                <CalendarRange className="size-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

export function MultipleSelected() {
    return (
        <ToggleGroup
            type="multiple"
            variant="outline"
            value={['mon', 'wed', 'fri']}
        >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <ToggleGroupItem
                    key={day}
                    value={day.toLowerCase()}
                    className={SELECTED}
                >
                    {day}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

export function FullWidthOptions() {
    return (
        <div className="w-full max-w-sm">
            <ToggleGroup
                type="single"
                variant="outline"
                value="in-person"
                className="w-full"
            >
                <ToggleGroupItem
                    value="in-person"
                    className={`h-9 flex-1 px-3 ${SELECTED}`}
                >
                    In person
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="online"
                    className={`h-9 flex-1 px-3 ${SELECTED}`}
                >
                    Online
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="both"
                    className={`h-9 flex-1 px-3 ${SELECTED}`}
                >
                    Both
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}

export function Disabled() {
    return (
        <ToggleGroup type="single" variant="outline" value="week" disabled>
            <ToggleGroupItem value="week" className={SELECTED}>
                Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className={SELECTED}>
                Month
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

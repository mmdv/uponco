import { ToggleGroup, ToggleGroupItem } from 'uponco';

const noop = () => {};

const SELECTED =
    'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground';

export function ScheduleViewSwitcher() {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            value="week"
            onValueChange={noop}
        >
            {[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'team', label: 'Team' },
            ].map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={SELECTED}
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

export function AppointmentsTimeframe() {
    return (
        <div className="w-full max-w-sm space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                Timeframe
            </span>
            <ToggleGroup
                type="single"
                variant="outline"
                value="upcoming"
                onValueChange={noop}
                className="w-full"
            >
                <ToggleGroupItem value="upcoming" className="flex-1 gap-2">
                    Upcoming
                    <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                        12
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="past" className="flex-1 gap-2">
                    Past
                    <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                        148
                    </span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}

export function RepeatWeeks() {
    return (
        <div className="w-full max-w-sm space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                Repeat this week for
            </span>
            <ToggleGroup
                type="single"
                variant="outline"
                value="4"
                onValueChange={noop}
                className="w-full"
            >
                {['1', '2', '4', '8'].map((weeks) => (
                    <ToggleGroupItem
                        key={weeks}
                        value={weeks}
                        className={`flex-1 ${SELECTED}`}
                    >
                        {weeks === '1' ? '1 week' : `${weeks} weeks`}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

export function MultipleSelection() {
    return (
        <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
                Where this service is delivered
            </span>
            <ToggleGroup
                type="multiple"
                variant="outline"
                value={['studio', 'online']}
                onValueChange={noop}
            >
                <ToggleGroupItem value="studio" className={SELECTED}>
                    At the studio
                </ToggleGroupItem>
                <ToggleGroupItem value="online" className={SELECTED}>
                    Online
                </ToggleGroupItem>
                <ToggleGroupItem value="home" className={SELECTED}>
                    Home visit
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}

export function DefaultVariant() {
    return (
        <ToggleGroup type="single" value="all" onValueChange={noop}>
            <ToggleGroupItem value="all">All services</ToggleGroupItem>
            <ToggleGroupItem value="massage">Massage</ToggleGroupItem>
            <ToggleGroupItem value="nails">Nails</ToggleGroupItem>
            <ToggleGroupItem value="hair">Hair</ToggleGroupItem>
        </ToggleGroup>
    );
}

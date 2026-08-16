import { Bell, Globe, Video } from 'lucide-react';
import { Toggle } from 'uponco';

const noop = () => {};

const SELECTED =
    'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground';

export function WorkingDays() {
    const days = [
        { label: 'M', on: true },
        { label: 'T', on: true },
        { label: 'W', on: true },
        { label: 'T', on: true },
        { label: 'F', on: true },
        { label: 'S', on: true },
        { label: 'S', on: false },
    ];

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Days Nizami Studio is open</p>
            <div className="flex gap-1.5">
                {days.map((day, index) => (
                    <Toggle
                        key={index}
                        variant="outline"
                        pressed={day.on}
                        onPressedChange={noop}
                        className={SELECTED}
                    >
                        {day.label}
                    </Toggle>
                ))}
            </div>
        </div>
    );
}

export function FilterToggles() {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Filter appointments</p>
            <div className="flex flex-wrap gap-2">
                <Toggle
                    variant="outline"
                    pressed
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    <Video />
                    Online only
                </Toggle>
                <Toggle
                    variant="outline"
                    pressed={false}
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    <Globe />
                    All locations
                </Toggle>
                <Toggle
                    variant="outline"
                    pressed={false}
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    <Bell />
                    Needs confirming
                </Toggle>
            </div>
        </div>
    );
}

export function VariantsAndStates() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">
                    default
                </span>
                <Toggle pressed onPressedChange={noop}>
                    On
                </Toggle>
                <Toggle pressed={false} onPressedChange={noop}>
                    Off
                </Toggle>
                <Toggle pressed={false} onPressedChange={noop} disabled>
                    Disabled
                </Toggle>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-muted-foreground">
                    outline
                </span>
                <Toggle variant="outline" pressed onPressedChange={noop}>
                    On
                </Toggle>
                <Toggle variant="outline" pressed={false} onPressedChange={noop}>
                    Off
                </Toggle>
                <Toggle
                    variant="outline"
                    pressed={false}
                    onPressedChange={noop}
                    disabled
                >
                    Disabled
                </Toggle>
            </div>
        </div>
    );
}

export function Sizes() {
    return (
        <div className="flex items-end gap-6">
            <div className="space-y-2 text-center">
                <Toggle
                    variant="outline"
                    size="sm"
                    pressed
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    Day
                </Toggle>
                <p className="text-xs text-muted-foreground">sm · h-8</p>
            </div>
            <div className="space-y-2 text-center">
                <Toggle
                    variant="outline"
                    pressed
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    Week
                </Toggle>
                <p className="text-xs text-muted-foreground">default · h-9</p>
            </div>
            <div className="space-y-2 text-center">
                <Toggle
                    variant="outline"
                    size="lg"
                    pressed
                    onPressedChange={noop}
                    className={SELECTED}
                >
                    Month
                </Toggle>
                <p className="text-xs text-muted-foreground">lg · h-10</p>
            </div>
        </div>
    );
}

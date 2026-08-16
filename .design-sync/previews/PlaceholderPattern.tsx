import { CalendarDays } from 'lucide-react';
import { Button, PlaceholderPattern } from 'uponco';

export function EmptyDayEmptyState() {
    return (
        <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border"
            style={{ stroke: 'rgba(15, 23, 42, 0.14)' }}
        >
            <PlaceholderPattern className="absolute inset-0 size-full" />
            <div className="relative flex flex-col items-center gap-3 px-6 py-12 text-center">
                <CalendarDays className="size-8 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">
                        Nothing booked on Thursday
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Nizami Studio has no appointments for 21 August yet.
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    Add an appointment
                </Button>
            </div>
        </div>
    );
}

export function DashboardPlaceholderGrid() {
    return (
        <div className="grid w-full max-w-2xl grid-cols-3 gap-4">
            {['Bookings', 'Revenue', 'Utilisation'].map((label) => (
                <div
                    key={label}
                    className="relative h-32 overflow-hidden rounded-xl border border-border"
                    style={{ stroke: 'rgba(15, 23, 42, 0.14)' }}
                >
                    <PlaceholderPattern className="absolute inset-0 size-full" />
                    <span className="relative flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
                        {label} chart
                    </span>
                </div>
            ))}
        </div>
    );
}

export function StrokeColours() {
    const swatches = [
        { label: 'Subtle', stroke: 'rgba(15, 23, 42, 0.08)' },
        { label: 'Default', stroke: 'rgba(15, 23, 42, 0.20)' },
        { label: 'Brand', stroke: 'rgba(0, 99, 255, 0.35)' },
    ];

    return (
        <div className="flex gap-4">
            {swatches.map((swatch) => (
                <div key={swatch.label} className="space-y-2 text-center">
                    <div
                        className="relative size-28 overflow-hidden rounded-xl border border-border"
                        style={{ stroke: swatch.stroke }}
                    >
                        <PlaceholderPattern className="absolute inset-0 size-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {swatch.label}
                    </p>
                </div>
            ))}
        </div>
    );
}

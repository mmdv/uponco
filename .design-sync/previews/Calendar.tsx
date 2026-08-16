import { Calendar } from 'uponco';

const august = new Date(2026, 7, 1);
const selectedDay = new Date(2026, 7, 20);
const noop = () => {};

export function PickAppointmentDate() {
    return (
        <div className="rounded-xl border border-border bg-card shadow-soft">
            <Calendar
                mode="single"
                selected={selectedDay}
                defaultMonth={august}
                onSelect={noop}
            />
        </div>
    );
}

export function ClosedDaysDisabled() {
    return (
        <div className="w-full max-w-sm space-y-3">
            <div>
                <p className="text-sm font-medium">Choose a date</p>
                <p className="text-xs text-muted-foreground">
                    Nizami Studio is closed on Sundays and for the summer break
                    from 24 to 28 August.
                </p>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-soft">
                <Calendar
                    mode="single"
                    selected={new Date(2026, 7, 19)}
                    defaultMonth={august}
                    disabled={[
                        { dayOfWeek: [0] },
                        { from: new Date(2026, 7, 24), to: new Date(2026, 7, 28) },
                        { before: new Date(2026, 7, 17) },
                    ]}
                    onSelect={noop}
                />
            </div>
        </div>
    );
}

export function BookingPanel() {
    const slots = ['09:00', '09:30', '11:00', '13:30', '14:30', '16:00'];

    return (
        <div className="flex gap-4 rounded-xl border border-border bg-card p-2 shadow-soft">
            <Calendar
                mode="single"
                selected={selectedDay}
                defaultMonth={august}
                disabled={{ before: new Date(2026, 7, 17) }}
                onSelect={noop}
            />
            <div className="w-40 space-y-2 border-l border-border py-3 pl-4">
                <p className="text-xs font-medium text-muted-foreground">
                    Thursday 20 August
                </p>
                {slots.map((slot) => (
                    <div
                        key={slot}
                        className="rounded-lg border border-border py-1.5 text-center text-sm"
                    >
                        {slot}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TwoMonths() {
    return (
        <div className="rounded-xl border border-border bg-card shadow-soft">
            <Calendar
                mode="single"
                numberOfMonths={2}
                selected={selectedDay}
                defaultMonth={august}
                onSelect={noop}
            />
        </div>
    );
}

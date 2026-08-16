import { DurationStepper, Label } from 'uponco';

const noop = () => {};

export function ServiceDuration() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="service-duration">Duration</Label>
            <DurationStepper id="service-duration" value={90} onChange={noop} />
            <p className="text-xs text-muted-foreground">
                How long a Deep Tissue Massage blocks the specialist&apos;s
                calendar.
            </p>
        </div>
    );
}

export function AtMinimum() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="quick-service-duration">Duration</Label>
            <DurationStepper
                id="quick-service-duration"
                value={15}
                min={15}
                onChange={noop}
            />
            <p className="text-xs text-muted-foreground">
                At the 15-minute floor, so the minus button is disabled.
            </p>
        </div>
    );
}

export function AtMaximum() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="retreat-duration">Duration</Label>
            <DurationStepper
                id="retreat-duration"
                value={240}
                max={240}
                onChange={noop}
            />
            <p className="text-xs text-muted-foreground">
                A half-day spa package capped at four hours.
            </p>
        </div>
    );
}

export function Invalid() {
    return (
        <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="invalid-duration">Duration</Label>
            <DurationStepper
                id="invalid-duration"
                value={0}
                onChange={noop}
                invalid
            />
            <p className="text-xs text-destructive">
                Enter how long this appointment should last.
            </p>
        </div>
    );
}

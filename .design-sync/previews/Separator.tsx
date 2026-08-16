import { Separator } from 'uponco';

export function BetweenCardSections() {
    return (
        <div className="max-w-md rounded-2xl border bg-card p-6">
            <p className="text-base font-semibold">Deep Tissue Massage</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Thursday 16 May · 11:30 – 12:30
            </p>

            <Separator className="my-6" />

            <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Specialist</dt>
                    <dd className="font-medium">Ayla Rzayeva</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">Nizami Street Studio</dd>
                </div>
            </dl>

            <Separator className="my-6" />

            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">₼80</span>
            </div>
        </div>
    );
}

export function VerticalBetweenStats() {
    return (
        <div className="flex h-16 items-center gap-6 rounded-2xl border bg-card px-6">
            <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-semibold">7 bookings</p>
            </div>
            <Separator orientation="vertical" />
            <div>
                <p className="text-xs text-muted-foreground">This week</p>
                <p className="text-lg font-semibold">41 bookings</p>
            </div>
            <Separator orientation="vertical" />
            <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-semibold">₼3,180</p>
            </div>
        </div>
    );
}

export function SplittingAMenu() {
    return (
        <div className="w-64 rounded-xl border bg-popover p-1 text-popover-foreground shadow-md">
            <div className="px-2 py-1.5 text-sm">Edit appointment</div>
            <div className="px-2 py-1.5 text-sm">Reschedule</div>
            <div className="px-2 py-1.5 text-sm">Message customer</div>
            <Separator className="my-1" />
            <div className="px-2 py-1.5 text-sm text-destructive">
                Cancel appointment
            </div>
        </div>
    );
}

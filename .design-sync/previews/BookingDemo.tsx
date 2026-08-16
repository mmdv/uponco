import { BookingDemo } from 'uponco';

/**
 * The hero's looping mini booking flow. It advances itself on a 1.7s interval,
 * so a still frame catches it at whichever of its four steps the capture lands
 * on — day strip, slot grid and the confirm button are always present.
 */
export function InTheHero() {
    return (
        <div className="w-full max-w-sm py-8">
            <BookingDemo />
        </div>
    );
}

/** How it sits beside the landing-page headline column. */
export function BesideTheHeadline() {
    return (
        <div className="flex w-full max-w-4xl items-center gap-10 py-6">
            <div className="flex-1">
                <h1 className="text-3xl font-semibold tracking-tight text-balance">
                    Bookings that fill themselves
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Share one link. Your customers pick a service, a specialist
                    and a time — Uponco handles the reminders and keeps every
                    location&apos;s calendar straight.
                </p>
            </div>
            <div className="w-80 shrink-0">
                <BookingDemo />
            </div>
        </div>
    );
}

import { CalendarX2, CircleAlert, Info, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from 'uponco';

export function BookingConflict() {
    return (
        <div className="w-full max-w-lg">
            <Alert>
                <CalendarX2 />
                <AlertTitle>That slot was just taken</AlertTitle>
                <AlertDescription>
                    Nigar Aliyeva is no longer free at 14:30 on Thursday. Pick
                    another time or another specialist to continue.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function DestructivePaymentFailed() {
    return (
        <div className="w-full max-w-lg">
            <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>We couldn't confirm this appointment</AlertTitle>
                <AlertDescription>
                    The deposit of ₼25 was declined by the customer's bank. The
                    slot is held for another 10 minutes.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function Variants() {
    return (
        <div className="w-full max-w-lg space-y-3">
            <Alert>
                <Info />
                <AlertTitle>Working hours updated</AlertTitle>
                <AlertDescription>
                    Nizami Studio now closes at 19:00 on Sundays.
                </AlertDescription>
            </Alert>

            <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Deep Tissue Massage has no specialist</AlertTitle>
                <AlertDescription>
                    Assign at least one specialist before the service can be
                    booked online.
                </AlertDescription>
            </Alert>

            <Alert>
                <Sparkles />
                <AlertTitle>Your booking page is live</AlertTitle>
            </Alert>
        </div>
    );
}

export function TitleOnlyAndNoIcon() {
    return (
        <div className="w-full max-w-lg space-y-3">
            <Alert>
                <AlertTitle>3 appointments still need confirming</AlertTitle>
                <AlertDescription>
                    Without a leading icon the grid collapses its first column,
                    so the text starts flush with the border.
                </AlertDescription>
            </Alert>

            <Alert>
                <Info />
                <AlertTitle>Gel Manicure is hidden from the booking page</AlertTitle>
            </Alert>
        </div>
    );
}

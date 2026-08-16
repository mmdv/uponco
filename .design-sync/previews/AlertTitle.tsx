import { CalendarClock, CircleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from 'uponco';

export function InsideAlert() {
    return (
        <div className="w-full max-w-lg">
            <Alert>
                <CalendarClock />
                <AlertTitle>Reminder emails are switched off</AlertTitle>
                <AlertDescription>
                    Customers booking at Nizami Studio won't be reminded the day
                    before their appointment.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function LongTitleClamps() {
    return (
        <div className="w-full max-w-md">
            <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>
                    Deep Tissue Massage, Hot Stone Therapy and Aromatherapy
                    Facial can no longer be booked at Port Baku Kiosk
                </AlertTitle>
                <AlertDescription>
                    The title is clamped to a single line; the detail belongs in
                    the description underneath.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function TitleOnly() {
    return (
        <div className="w-full max-w-lg">
            <Alert>
                <CalendarClock />
                <AlertTitle>Next appointment: Gel Manicure at 11:00</AlertTitle>
            </Alert>
        </div>
    );
}

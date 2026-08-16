import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from 'uponco';

export function AppointmentStatuses() {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Badge>
                <CheckCircle2 />
                Confirmed
            </Badge>
            <Badge variant="secondary">
                <Clock />
                Pending
            </Badge>
            <Badge variant="destructive">
                <XCircle />
                Cancelled
            </Badge>
            <Badge variant="outline">Completed</Badge>
        </div>
    );
}

export function InAppointmentRow() {
    return (
        <div className="w-full max-w-md rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Deep Tissue Massage</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        Mon, 17 Aug · 10:30 · Leyla Hüseynova
                    </p>
                </div>
                <Badge variant="secondary">Pending</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                <Badge variant="outline">90 min</Badge>
                <Badge variant="outline">120 ₼</Badge>
                <Badge variant="outline">Nizami Studio</Badge>
            </div>
        </div>
    );
}

export function CountsAndLabels() {
    return (
        <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                <span className="text-sm font-medium">Appointments</span>
                <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                <span className="text-sm font-medium">Unread reminders</span>
                <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                <span className="text-sm font-medium">Gel Manicure</span>
                <Badge>Group · 6 seats</Badge>
            </div>
        </div>
    );
}

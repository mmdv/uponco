import { Check, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from 'uponco';

export function DetailList() {
    const rows = [
        ['Service', 'Deep Tissue Massage'],
        ['Specialist', 'Nigar Aliyeva'],
        ['Location', 'Nizami Studio'],
        ['Duration', '60 minutes'],
        ['Price', '₼75'],
    ];

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Appointment details</CardTitle>
                <CardDescription>Booked 14 August, 09:12</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border text-sm">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between py-2"
                    >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function ChecklistContent() {
    const items = [
        { label: 'Business hours set', done: true },
        { label: 'First service added', done: true },
        { label: 'Specialist invited', done: true },
        { label: 'Booking link shared', done: false },
    ];

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Finish setting up</CardTitle>
                <CardDescription>3 of 4 steps done</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className={
                                item.done
                                    ? 'flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
                                    : 'flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground'
                            }
                        >
                            {item.done ? (
                                <Check className="size-3" />
                            ) : (
                                <X className="size-3" />
                            )}
                        </span>
                        <span
                            className={
                                item.done
                                    ? 'text-muted-foreground'
                                    : 'font-medium'
                            }
                        >
                            {item.label}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function EdgeToEdgeContent() {
    const slots = ['09:00', '09:30', '11:00', '13:30', '14:30', '16:00'];

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Thursday, 21 August</CardTitle>
                <CardDescription>
                    Free times with Nigar Aliyeva
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                    <span
                        key={slot}
                        className="rounded-lg border border-border py-2 text-center text-sm"
                    >
                        {slot}
                    </span>
                ))}
            </CardContent>
        </Card>
    );
}

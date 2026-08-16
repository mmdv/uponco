import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'uponco';

export function AppointmentSummary() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Deep Tissue Massage</CardTitle>
                <CardDescription>
                    60 minutes with Nigar Aliyeva · ₼75
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    Thursday, 21 August
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    14:30 – 15:30 (Asia/Baku)
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    Nizami Studio, 28 May küç. 12
                </p>
            </CardContent>
            <CardFooter className="justify-between gap-3">
                <Button variant="outline">Reschedule</Button>
                <Button>Confirm booking</Button>
            </CardFooter>
        </Card>
    );
}

export function StatCardGrid() {
    const stats = [
        { label: 'Bookings this week', value: '48', delta: '+12%' },
        { label: 'Revenue', value: '₼3,240', delta: '+8%' },
        { label: 'No-shows', value: '3', delta: '−2' },
    ];

    return (
        <div className="grid w-full max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="gap-2 py-5">
                    <CardHeader className="px-5">
                        <CardDescription>{stat.label}</CardDescription>
                        <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5">
                        <span className="text-xs font-medium text-primary">
                            {stat.delta} vs last week
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ClassWithCapacity() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                        <CardTitle>Reformer Pilates</CardTitle>
                        <CardDescription>
                            Group class · 50 minutes · ₼30 per place
                        </CardDescription>
                    </div>
                    <Badge>Live</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />9 of 12 places booked for
                    Tuesday 08:00
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: '75%' }} />
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">
                    View attendee list
                </Button>
            </CardFooter>
        </Card>
    );
}

export function ContentOnly() {
    return (
        <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">Gel Manicure</p>
                    <p className="text-xs text-muted-foreground">
                        45 min · Leyla Hüseynova · Port Baku Kiosk
                    </p>
                </div>
                <span className="text-sm font-semibold">₼40</span>
            </CardContent>
        </Card>
    );
}

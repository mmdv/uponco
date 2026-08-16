import { CalendarDays, Clock, Users } from 'lucide-react';
import { BookingsGraphic, CustomersGraphic, StatCard, UpcomingGraphic } from 'uponco';

export function Default() {
    return (
        <div className="max-w-xs">
            <StatCard
                icon={CalendarDays}
                label="Appointments this week"
                value={128}
                href="/appointments"
                accent="brand"
                graphic={<BookingsGraphic />}
                mounted
            />
        </div>
    );
}

export function AccentScale() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatCard
                icon={CalendarDays}
                label="Appointments this week"
                value={128}
                href="/appointments"
                accent="ink"
                graphic={<BookingsGraphic />}
                mounted
            />
            <StatCard
                icon={Users}
                label="Active customers"
                value={1432}
                href="/customers"
                accent="deep"
                graphic={<CustomersGraphic />}
                mounted
            />
            <StatCard
                icon={Clock}
                label="Hours booked"
                value={96}
                href="/schedule"
                accent="bright"
                graphic={<UpcomingGraphic />}
                mounted
            />
            <StatCard
                icon={CalendarDays}
                label="Upcoming today"
                value={7}
                href="/appointments"
                accent="soft"
                graphic={<UpcomingGraphic />}
                mounted
            />
        </div>
    );
}

export function EmptyWithHint() {
    return (
        <div className="max-w-xs">
            <StatCard
                icon={Users}
                label="Active customers"
                value={0}
                hint="No customers yet — add your first"
                href="/customers"
                accent="soft"
                graphic={<CustomersGraphic />}
                mounted
            />
        </div>
    );
}

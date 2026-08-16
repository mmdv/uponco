import { DashboardStats } from 'uponco';

export function BusyStudio() {
    return (
        <div className="w-full max-w-3xl">
            <DashboardStats
                mounted
                stats={{
                    customers: 428,
                    totalBookings: 1_264,
                    upcoming: 37,
                    services: 14,
                    locations: 3,
                }}
            />
        </div>
    );
}

export function NewTeam() {
    return (
        <div className="w-full max-w-3xl">
            <DashboardStats
                mounted
                stats={{
                    customers: 0,
                    totalBookings: 0,
                    upcoming: 0,
                    services: 1,
                    locations: 1,
                }}
            />
        </div>
    );
}

export function InDashboardSection() {
    return (
        <div className="w-full max-w-3xl space-y-4">
            <div>
                <h2 className="text-lg font-semibold">
                    Good morning, Leyla
                </h2>
                <p className="text-sm text-muted-foreground">
                    Here&apos;s how Aurora Beauty Studio is doing today.
                </p>
            </div>
            <DashboardStats
                mounted
                stats={{
                    customers: 62,
                    totalBookings: 148,
                    upcoming: 9,
                    services: 6,
                    locations: 1,
                }}
            />
        </div>
    );
}

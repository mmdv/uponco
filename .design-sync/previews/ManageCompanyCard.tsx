import { ManageCompanyCard } from 'uponco';

export function Default() {
    return (
        <div className="max-w-xl">
            <ManageCompanyCard />
        </div>
    );
}

export function InDashboardGrid() {
    return (
        <div className="grid max-w-3xl grid-cols-2 gap-4">
            <ManageCompanyCard />
            <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                Sits beside the booking-share and schedule cards on the
                dashboard, so it has to hold its own at half width.
            </div>
        </div>
    );
}

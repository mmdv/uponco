import { Button, DashboardHeader } from 'uponco';

export function Default() {
    return <DashboardHeader firstName="Leyla" />;
}

export function InPageTopBar() {
    return (
        <div className="flex w-full flex-wrap items-end justify-between gap-4 rounded-xl border bg-card p-5">
            <DashboardHeader firstName="Kamran" />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    Share booking page
                </Button>
                <Button size="sm">New appointment</Button>
            </div>
        </div>
    );
}

export function NarrowColumn() {
    return (
        <div className="w-56 rounded-xl border bg-card p-4">
            <DashboardHeader firstName="Nigar-Aysel" />
        </div>
    );
}

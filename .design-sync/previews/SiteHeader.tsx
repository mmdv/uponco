import { SiteHeader } from 'uponco';

export function Default() {
    return (
        <div className="w-full">
            <SiteHeader />
        </div>
    );
}

export function AbovePageContent() {
    return (
        <div className="w-full overflow-hidden rounded-xl border bg-background">
            <SiteHeader />
            <div className="mx-auto max-w-6xl px-6 py-10">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Bookings that run themselves
                </h1>
                <p className="mt-2 max-w-md text-muted-foreground">
                    Share one link and let clients pick a service, a specialist
                    and a time that you are actually free.
                </p>
            </div>
        </div>
    );
}

import { Button, Spinner } from 'uponco';

const sizes = [
    { className: 'size-3', label: 'size-3', use: 'Inline hint' },
    { className: '', label: 'size-4', use: 'Default · buttons' },
    { className: 'size-6', label: 'size-6', use: 'Slot list' },
    { className: 'size-8', label: 'size-8', use: 'Full page' },
];

export function Sizes() {
    return (
        <div className="flex flex-wrap items-stretch gap-3">
            {sizes.map((size) => (
                <div
                    key={size.label}
                    className="flex w-32 flex-col items-center gap-3 rounded-xl border bg-card p-4"
                >
                    <div className="flex h-8 items-center text-primary">
                        <Spinner className={size.className} />
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium">{size.label}</p>
                        <p className="text-xs text-muted-foreground">
                            {size.use}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function InsideButtons() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button disabled>
                <Spinner />
                Confirming booking
            </Button>
            <Button variant="outline" disabled>
                <Spinner />
                Loading slots
            </Button>
            <Button variant="ghost" size="sm" disabled>
                <Spinner className="size-3.5" />
                Saving
            </Button>
        </div>
    );
}

export function LoadingSlots() {
    return (
        <div className="w-full max-w-sm rounded-xl border bg-card p-5">
            <p className="text-sm font-medium">Choose a time</p>
            <p className="mt-1 text-xs text-muted-foreground">
                Leyla Hüseynova · Mon, 17 Aug
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 py-8 text-muted-foreground">
                <Spinner className="size-6" />
                <p className="text-sm">Checking availability…</p>
            </div>
        </div>
    );
}

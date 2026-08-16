import { PaginationControls } from 'uponco';

const strings: Record<string, string> = {
    'pagination.showing': 'Showing :from–:to of :total customers',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
};

function translate(key: string, replacements?: Record<string, unknown>) {
    let value = strings[key] ?? key;

    for (const [token, replacement] of Object.entries(replacements ?? {})) {
        value = value.replace(`:${token}`, String(replacement));
    }

    return value;
}

function page(current: number, last: number) {
    const perPage = 25;
    const total = 118;

    return {
        data: [],
        current_page: current,
        last_page: last,
        per_page: perPage,
        total,
        from: (current - 1) * perPage + 1,
        to: Math.min(current * perPage, total),
    };
}

export function FirstPage() {
    return (
        <div className="w-full max-w-2xl">
            <PaginationControls
                page={page(1, 5)}
                onPageChange={() => {}}
                t={translate}
                testPrefix="customers"
            />
        </div>
    );
}

export function MiddlePage() {
    return (
        <div className="w-full max-w-2xl">
            <PaginationControls
                page={page(3, 5)}
                onPageChange={() => {}}
                t={translate}
                testPrefix="customers"
            />
        </div>
    );
}

export function LastPage() {
    return (
        <div className="w-full max-w-2xl">
            <PaginationControls
                page={page(5, 5)}
                onPageChange={() => {}}
                t={translate}
                testPrefix="customers"
            />
        </div>
    );
}

export function UnderACustomerList() {
    return (
        <div className="w-full max-w-2xl rounded-xl border">
            <div className="divide-y">
                {[
                    ['Nigar Aliyeva', 'nigar@example.az', '6 bookings'],
                    ['Kamran Hasanov', 'kamran@example.az', '2 bookings'],
                    ['Leyla Mammadova', 'leyla@example.az', '11 bookings'],
                ].map(([name, email, count]) => (
                    <div
                        key={email}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                        <div>
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">
                                {email}
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
            <div className="border-t p-4">
                <PaginationControls
                    page={page(2, 5)}
                    onPageChange={() => {}}
                    t={translate}
                    testPrefix="customers"
                />
            </div>
        </div>
    );
}

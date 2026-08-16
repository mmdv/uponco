import { useLayoutEffect } from 'react';
import { QuickActions } from 'uponco';

/** Opens the speed dial the way a tap would, so the menu can be photographed. */
function OpenOnMount() {
    useLayoutEffect(() => {
        const fab = document.querySelector<HTMLButtonElement>(
            '[data-test="quick-actions-fab"]',
        );

        fab?.click();
    }, []);

    return null;
}

function DashboardBackdrop() {
    return (
        <div className="w-full max-w-2xl space-y-3 p-6">
            <h2 className="text-lg font-semibold">Today · Tuesday 19 August</h2>
            <div className="divide-y rounded-xl border">
                <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                        <p className="text-sm font-medium">
                            Deep Tissue Massage
                        </p>
                        <p className="text-xs text-muted-foreground">
                            11:30 · Leyla Mammadova
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground">₼85</span>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                        <p className="text-sm font-medium">Gel Manicure</p>
                        <p className="text-xs text-muted-foreground">
                            13:00 · Nigar Aliyeva
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground">₼40</span>
                </div>
            </div>
        </div>
    );
}

const noop = () => {};

/** The dial is `fixed`, so the cell needs a page's worth of height under it. */
function Page({ children }: { children?: React.ReactNode }) {
    return (
        <div className="w-full" style={{ minHeight: 640 }}>
            <DashboardBackdrop />
            <QuickActions
                onAddAppointment={noop}
                onAddCustomer={noop}
                onAddService={noop}
                onAddLocation={noop}
            />
            {children}
        </div>
    );
}

export function Collapsed() {
    return <Page />;
}

export function Expanded() {
    return (
        <Page>
            <OpenOnMount />
        </Page>
    );
}

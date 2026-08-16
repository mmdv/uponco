import { MonthTabs, ScheduleProvider } from 'uponco';

const monthTabs = [
    { key: '2026-08', monthLabel: 'Aug', year: 2026, month: 7, isCurrent: true },
    {
        key: '2026-09',
        monthLabel: 'Sep',
        year: 2026,
        month: 8,
        isCurrent: false,
    },
    {
        key: '2026-10',
        monthLabel: 'Oct',
        year: 2026,
        month: 9,
        isCurrent: false,
    },
    {
        key: '2026-11',
        monthLabel: 'Nov',
        year: 2026,
        month: 10,
        isCurrent: false,
    },
    {
        key: '2026-12',
        monthLabel: 'Dec',
        year: 2026,
        month: 11,
        isCurrent: false,
    },
];

const members = [
    { id: 1, name: 'Leyla Hüseynova', role: 'owner' as const },
    { id: 2, name: 'Nigar Əliyeva', role: 'member' as const },
];

function Strip({ defaultMonthKey }: { defaultMonthKey: string }) {
    return (
        <ScheduleProvider
            members={members}
            showMemberColumn
            monthTabs={monthTabs}
            defaultMonthKey={defaultMonthKey}
            slots={{}}
        >
            <MonthTabs />
        </ScheduleProvider>
    );
}

/**
 * The schedule page's month carousel. `MonthTabs` reads everything from the
 * schedule context, so the preview is the strip inside a `ScheduleProvider`.
 */
export function CurrentMonthActive() {
    return (
        <div className="max-w-lg">
            <Strip defaultMonthKey="2026-08" />
        </div>
    );
}

/**
 * A later month selected: the active tab takes the solid brand fill while the
 * current month keeps only its brand-tinted border.
 */
export function LaterMonthActive() {
    return (
        <div className="max-w-lg">
            <Strip defaultMonthKey="2026-10" />
        </div>
    );
}

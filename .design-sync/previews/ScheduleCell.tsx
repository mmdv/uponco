import { useLayoutEffect } from 'react';
import { ScheduleCell, ScheduleProvider, useSchedule } from 'uponco';

type Column = {
    key: string;
    date: Date;
    dayNumber: string;
    weekday: string;
    isToday: boolean;
    isPast: boolean;
};

const MEMBER_ID = 4;

function column(
    key: string,
    dayNumber: string,
    weekday: string,
    options: { isToday?: boolean; isPast?: boolean } = {},
): Column {
    return {
        key,
        date: new Date(`${key}T00:00:00`),
        dayNumber,
        weekday,
        isToday: options.isToday ?? false,
        isPast: options.isPast ?? false,
    };
}

const MONTH_TABS = [
    {
        key: '2026-08',
        monthLabel: 'Aug',
        year: 2026,
        month: 7,
        isCurrent: true,
    },
];

const MEMBERS = [
    { id: MEMBER_ID, name: 'Leyla Aliyeva', avatar: null, role: 'specialist' },
];

/** Column headers so a bare cell reads as part of the scheduling grid. */
function Header({ label }: { label: string }) {
    return (
        <div className="w-20 shrink-0 border-r border-b border-border/60 py-1 text-center">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
    );
}

function Grid({
    slots,
    children,
}: {
    slots?: Record<string, { start: string; end: string }[]>;
    children: React.ReactNode;
}) {
    return (
        <ScheduleProvider
            members={MEMBERS}
            showMemberColumn={false}
            monthTabs={MONTH_TABS}
            defaultMonthKey="2026-08"
            slots={slots ?? {}}
        >
            <div className="overflow-hidden rounded-lg border border-border/60">
                {children}
            </div>
        </ScheduleProvider>
    );
}

export function Available() {
    return (
        <Grid>
            <div className="flex">
                <Header label="Mon" />
                <Header label="Tue" />
            </div>
            <div className="flex">
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-17', '17', 'Mon')}
                />
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-18', '18', 'Tue')}
                />
            </div>
        </Grid>
    );
}

export function Scheduled() {
    return (
        <Grid
            slots={{
                '4:2026-08-17': [{ start: '09:00', end: '13:00' }],
                '4:2026-08-18': [
                    { start: '09:00', end: '13:00' },
                    { start: '14:00', end: '19:00' },
                ],
            }}
        >
            <div className="flex">
                <Header label="Mon" />
                <Header label="Tue" />
            </div>
            <div className="flex">
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-17', '17', 'Mon')}
                />
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-18', '18', 'Tue')}
                />
            </div>
        </Grid>
    );
}

export function OverflowingSlots() {
    return (
        <Grid
            slots={{
                '4:2026-08-19': [
                    { start: '09:00', end: '10:30' },
                    { start: '11:00', end: '12:30' },
                    { start: '13:00', end: '15:00' },
                    { start: '16:00', end: '19:00' },
                ],
            }}
        >
            <div className="flex">
                <Header label="Wed" />
            </div>
            <div className="flex">
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-19', '19', 'Wed')}
                />
            </div>
        </Grid>
    );
}

/** Selection lives in the provider, so a preview has to toggle it on mount. */
function SelectOnMount({ cellIds }: { cellIds: string[] }) {
    const { toggleCell, isSelected } = useSchedule();

    useLayoutEffect(() => {
        for (const id of cellIds) {
            if (!isSelected(id)) {
                toggleCell(id);
            }
        }
        // Runs once — the preview is a static snapshot.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export function Selected() {
    return (
        <Grid>
            <SelectOnMount cellIds={['4:2026-08-17']} />
            <div className="flex">
                <Header label="Mon" />
                <Header label="Tue" />
            </div>
            <div className="flex">
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-17', '17', 'Mon')}
                />
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-18', '18', 'Tue')}
                />
            </div>
        </Grid>
    );
}

export function PastAndToday() {
    return (
        <Grid slots={{ '4:2026-08-14': [{ start: '10:00', end: '16:00' }] }}>
            <div className="flex">
                <Header label="Fri" />
                <Header label="Sat" />
                <Header label="Sun" />
            </div>
            <div className="flex">
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-14', '14', 'Fri', { isPast: true })}
                />
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-15', '15', 'Sat', { isPast: true })}
                />
                <ScheduleCell
                    memberId={MEMBER_ID}
                    column={column('2026-08-16', '16', 'Sun', {
                        isToday: true,
                    })}
                />
            </div>
        </Grid>
    );
}

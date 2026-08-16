import { StepDateTime } from 'uponco';

const noop = () => {};

// Baku is a fixed UTC+4 with no DST, so a `HH:MM` wall-clock time is exactly
// four hours behind its UTC instant. The component derives the label it paints
// from `start` + `timezone` (not from `slot.label`), so the starts below are the
// UTC instants that render as the round Baku times a real day would generate.
const TIMEZONE = 'Asia/Baku';

/** 10:00 Baku → 06:00Z. Builds a contiguous 30-minute slot from a Baku HH:MM. */
const slot = (
    day: string,
    bakuHour: number,
    bakuMinute: number,
    remaining: number | null = null,
): {
    start: string;
    end: string;
    label: string;
    available: boolean;
    remaining: number | null;
} => {
    const utcHour = bakuHour - 4;
    const pad = (n: number) => String(n).padStart(2, '0');
    const startIso = `${day}T${pad(utcHour)}:${pad(bakuMinute)}:00.000Z`;
    const endMinutes = utcHour * 60 + bakuMinute + 30;
    const endIso = `${day}T${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}:00.000Z`;

    return {
        start: startIso,
        end: endIso,
        label: `${pad(bakuHour)}:${pad(bakuMinute)}`,
        available: remaining === null ? true : remaining > 0,
        remaining,
    };
};

const DAY = '2026-08-17';

// The horizontal day strip: today, tomorrow, then the weekdays after. The
// component labels weekday/month from bundled translation lists keyed off the
// parsed date, so `weekday`/`month` here are only shape-fillers.
const days = [
    { date: '2026-08-16', weekday: 'Sun', day: '16', month: 'Aug', isToday: true, isTomorrow: false, available: false },
    { date: '2026-08-17', weekday: 'Mon', day: '17', month: 'Aug', isToday: false, isTomorrow: true, available: true },
    { date: '2026-08-18', weekday: 'Tue', day: '18', month: 'Aug', isToday: false, isTomorrow: false, available: true },
    { date: '2026-08-19', weekday: 'Wed', day: '19', month: 'Aug', isToday: false, isTomorrow: false, available: true },
    { date: '2026-08-20', weekday: 'Thu', day: '20', month: 'Aug', isToday: false, isTomorrow: false, available: false },
    { date: '2026-08-21', weekday: 'Fri', day: '21', month: 'Aug', isToday: false, isTomorrow: false, available: true },
    { date: '2026-08-22', weekday: 'Sat', day: '22', month: 'Aug', isToday: false, isTomorrow: false, available: true },
];

// Contiguous 30-minute marks across a morning and an afternoon block.
const individualSlots = [
    slot(DAY, 10, 0),
    slot(DAY, 10, 30),
    slot(DAY, 11, 0),
    slot(DAY, 11, 30),
    slot(DAY, 14, 0),
    slot(DAY, 14, 30),
    slot(DAY, 15, 0),
    slot(DAY, 15, 30),
    slot(DAY, 16, 0),
];

// A group service: each slot carries the seats left, and the 11:00 session is
// full, which the grid shows struck-through rather than hidden.
const groupSlots = [
    slot(DAY, 10, 0, 4),
    slot(DAY, 10, 30, 2),
    slot(DAY, 11, 0, 0),
    slot(DAY, 11, 30, 6),
    slot(DAY, 14, 0, 1),
    slot(DAY, 14, 30, 5),
];

const Frame = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl border bg-card p-5">
        {children}
    </div>
);

export function PickingATime() {
    return (
        <Frame>
            <StepDateTime
                days={days}
                date={DAY}
                onDateChange={noop}
                timezone={TIMEZONE}
                slots={individualSlots}
                loading={false}
                selectedStart={individualSlots[4].start}
                onSelectSlot={noop}
            />
        </Frame>
    );
}

export function LoadingSlots() {
    return (
        <Frame>
            <StepDateTime
                days={days}
                date={DAY}
                onDateChange={noop}
                timezone={TIMEZONE}
                slots={[]}
                loading
                selectedStart=""
                onSelectSlot={noop}
            />
        </Frame>
    );
}

export function NoTimesThatDay() {
    return (
        <Frame>
            <StepDateTime
                days={days}
                date="2026-08-21"
                onDateChange={noop}
                timezone={TIMEZONE}
                slots={[]}
                loading={false}
                selectedStart=""
                onSelectSlot={noop}
            />
        </Frame>
    );
}

export function GroupSessionSomeFull() {
    return (
        <Frame>
            <StepDateTime
                days={days}
                date={DAY}
                onDateChange={noop}
                timezone={TIMEZONE}
                slots={groupSlots}
                loading={false}
                selectedStart={groupSlots[1].start}
                onSelectSlot={noop}
            />
        </Frame>
    );
}

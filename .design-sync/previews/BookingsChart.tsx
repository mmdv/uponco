import { BookingsChart } from 'uponco';

const week = [
    { date: '2026-08-17', label: 'Mon', count: 6, isToday: true },
    { date: '2026-08-18', label: 'Tue', count: 9, isToday: false },
    { date: '2026-08-19', label: 'Wed', count: 4, isToday: false },
    { date: '2026-08-20', label: 'Thu', count: 11, isToday: false },
    { date: '2026-08-21', label: 'Fri', count: 14, isToday: false },
    { date: '2026-08-22', label: 'Sat', count: 8, isToday: false },
    { date: '2026-08-23', label: 'Sun', count: 2, isToday: false },
];

const quietWeek = week.map((day, index) => ({
    ...day,
    count: index === 3 ? 2 : 0,
}));

/** The week-ahead bar chart as it sits on the dashboard's main column. */
export function Default() {
    return (
        <div className="max-w-xl">
            <BookingsChart trend={week} mounted />
        </div>
    );
}

/** A nearly empty week — only Thursday has anything booked. */
export function QuietWeek() {
    return (
        <div className="max-w-xl">
            <BookingsChart trend={quietWeek} mounted />
        </div>
    );
}

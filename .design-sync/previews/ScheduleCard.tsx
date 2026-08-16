import { ScheduleCard } from 'uponco';

function summary(minutes: number[], todayIndex: number, openNow: boolean) {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return {
        days: minutes.map((value, index) => ({
            key: `2026-08-${17 + index}`,
            label: labels[index],
            minutes: value,
            isToday: index === todayIndex,
        })),
        totalMinutes: minutes.reduce((total, value) => total + value, 0),
        openNow,
    };
}

export function BusyWeek() {
    return (
        <div className="w-full max-w-sm">
            <ScheduleCard
                schedule={summary([480, 480, 450, 510, 420, 240, 0], 3, true)}
            />
        </div>
    );
}

export function QuietWeek() {
    return (
        <div className="w-full max-w-sm">
            <ScheduleCard
                schedule={summary([180, 0, 240, 0, 120, 0, 0], 1, false)}
            />
        </div>
    );
}

export function NoHoursSet() {
    return (
        <div className="w-full max-w-sm">
            <ScheduleCard schedule={summary([0, 0, 0, 0, 0, 0, 0], 0, false)} />
        </div>
    );
}

export function InDashboardGrid() {
    return (
        <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
            <ScheduleCard
                schedule={summary([480, 480, 450, 510, 420, 240, 0], 2, true)}
            />
            <ScheduleCard
                schedule={summary([300, 360, 300, 0, 480, 180, 0], 4, false)}
            />
        </div>
    );
}

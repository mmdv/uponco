import { SpecialistPicker } from 'uponco';

const noop = () => {};

const specialists = [
    {
        id: 1,
        name: 'Leyla Hüseynova',
        avatar: null,
        job_title: 'Senior massage therapist',
        description: 'Twelve years of deep tissue and sports massage.',
        service_ids: [1, 2],
        location_ids: [1],
        service_durations: { '1': 90, '2': 60 },
        next_available: {
            date: '2026-08-17',
            label: 'Tomorrow',
            slots: [
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '14:00',
                '14:30',
                '15:00',
            ],
        },
        available_days: ['2026-08-17', '2026-08-18'],
    },
    {
        id: 2,
        name: 'Səbinə Quliyeva',
        avatar: null,
        job_title: 'Nail technician',
        description: 'Gel and structured manicures.',
        service_ids: [1, 3],
        location_ids: [1, 2],
        service_durations: { '1': 90, '3': 45 },
        next_available: {
            date: '2026-08-16',
            label: 'Today',
            slots: ['15:00', '15:30', '16:00', '16:30', '17:00'],
        },
        available_days: ['2026-08-16', '2026-08-17'],
    },
    {
        id: 3,
        name: 'Kamran Həsənov',
        avatar: null,
        job_title: 'Barber',
        description: 'Classic cuts, beard shaping and hot-towel shaves.',
        service_ids: [4],
        location_ids: [1],
        service_durations: { '4': 30 },
        next_available: {
            date: '2026-08-19',
            label: 'Wed, 19 Aug',
            slots: ['09:00', '09:30', '10:00', '10:30', '12:00', '12:30'],
        },
        available_days: ['2026-08-19'],
    },
];

const fullyBooked = [
    {
        ...specialists[0],
        id: 4,
        name: 'Nurlan Əliyev',
        job_title: 'Physiotherapist',
        next_available: null,
        available_days: [],
    },
];

export function ChoosingASpecialist() {
    return (
        <div className="w-full max-w-md">
            <SpecialistPicker
                specialists={specialists}
                selectedId={null}
                serviceDuration={null}
                onSelect={noop}
            />
        </div>
    );
}

/** With a specialist picked: the row takes the brand accent and a check mark. */
export function SpecialistSelected() {
    return (
        <div className="w-full max-w-md">
            <SpecialistPicker
                specialists={specialists}
                selectedId={2}
                serviceDuration={45}
                onSelect={noop}
            />
        </div>
    );
}

/**
 * A 90-minute service filters each preview down to the openings long enough to
 * hold it, and a specialist with no free days falls back to the empty line.
 */
export function FilteredByServiceDuration() {
    return (
        <div className="w-full max-w-md">
            <SpecialistPicker
                specialists={[specialists[0], ...fullyBooked]}
                selectedId={1}
                serviceDuration={90}
                onSelect={noop}
            />
        </div>
    );
}

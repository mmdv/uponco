import { useLayoutEffect } from 'react';
import { SpecialistProfileDialog } from 'uponco';

/**
 * The dialog owns its content element, so its autofocus can't be prevented by
 * a prop — the close button would otherwise screenshot with a focus ring.
 */
function DropFocus() {
    useLayoutEffect(() => {
        const drop = () => (document.activeElement as HTMLElement)?.blur();
        const frame = requestAnimationFrame(drop);

        return () => cancelAnimationFrame(frame);
    }, []);

    return null;
}

const base = {
    service_ids: [1, 2],
    location_ids: [1],
    service_durations: { '1': 60 },
    next_available: null,
    available_days: [],
};

export function WithBio() {
    return (
        <>
        <DropFocus />
        <SpecialistProfileDialog
            onClose={() => {}}
            specialist={{
                ...base,
                id: 1,
                name: 'Leyla Mammadova',
                job_title: 'Senior Massage Therapist',
                description:
                    'Twelve years of clinical and sports massage, trained in Istanbul and Baku. Works mostly with deep tissue and post-injury recovery, and will happily adjust pressure mid-session.',
            }}
        />
        </>
    );
}

export function NoDescription() {
    return (
        <>
        <DropFocus />
        <SpecialistProfileDialog
            onClose={() => {}}
            specialist={{
                ...base,
                id: 2,
                name: 'Kamran Hasanov',
                job_title: 'Barber',
                description: null,
            }}
        />
        </>
    );
}

export function NameOnly() {
    return (
        <>
        <DropFocus />
        <SpecialistProfileDialog
            onClose={() => {}}
            specialist={{
                ...base,
                id: 3,
                name: 'Nigar Aliyeva',
                job_title: null,
                description:
                    'Gel and structured manicure specialist. Books up quickly on Saturdays.',
            }}
        />
        </>
    );
}

import { QuickCreateForms } from 'uponco';

const noop = () => {};

const services = [
    {
        id: 1,
        title: 'Deep Tissue Massage',
        description: 'Firm pressure work for tight shoulders and lower back.',
        duration: 90,
        price_type: 'fixed' as const,
        price: '120',
        price_min: null,
        price_max: null,
        currency: 'AZN' as const,
        delivery_type: 'onsite' as const,
        service_type: 'individual' as const,
        capacity: null,
        category_id: 1,
        category_name: 'Massage',
        location_ids: [1, 2],
        specialist_ids: [1, 2],
    },
    {
        id: 2,
        title: 'Gel Manicure',
        description: 'Shape, cuticle care and a two-week gel finish.',
        duration: 45,
        price_type: 'fixed' as const,
        price: '45',
        price_min: null,
        price_max: null,
        currency: 'AZN' as const,
        delivery_type: 'onsite' as const,
        service_type: 'individual' as const,
        capacity: null,
        category_id: 2,
        category_name: 'Nails',
        location_ids: [1],
        specialist_ids: [2],
    },
];

const locations = [
    { id: 1, name: 'Nizami Studio', service_ids: [1, 2], specialist_ids: [1, 2] },
    { id: 2, name: 'Port Baku Kiosk', service_ids: [1], specialist_ids: [1] },
];

const specialists = [
    {
        id: 1,
        name: 'Leyla Hüseynova',
        avatar: null,
        job_title: 'Senior massage therapist',
        description: 'Twelve years of deep tissue and sports massage.',
        service_ids: [1],
        location_ids: [1, 2],
        service_durations: { '1': 90 },
        next_available: {
            date: '2026-08-17',
            label: 'Tomorrow',
            slots: ['10:00', '10:30', '11:00', '11:30'],
        },
        available_days: ['2026-08-17'],
    },
    {
        id: 2,
        name: 'Səbinə Quliyeva',
        avatar: null,
        job_title: 'Nail technician',
        description: 'Gel and structured manicures.',
        service_ids: [1, 2],
        location_ids: [1],
        service_durations: { '1': 90, '2': 45 },
        next_available: {
            date: '2026-08-16',
            label: 'Today',
            slots: ['15:00', '15:30', '16:00'],
        },
        available_days: ['2026-08-16'],
    },
];

const selectOptions = (
    entries: [string, string][],
): { value: string; label: string }[] =>
    entries.map(([value, label]) => ({ value, label }));

const options = {
    appointments: { services, locations, specialists },
    services: {
        categories: [
            { id: 1, name: 'Massage' },
            { id: 2, name: 'Nails' },
        ],
        services: selectOptions([
            ['1', 'Deep Tissue Massage'],
            ['2', 'Gel Manicure'],
        ]),
        locations: selectOptions([
            ['1', 'Nizami Studio'],
            ['2', 'Port Baku Kiosk'],
        ]),
        specialists: selectOptions([
            ['1', 'Leyla Hüseynova'],
            ['2', 'Səbinə Quliyeva'],
        ]),
        countries: selectOptions([
            ['AZ', 'Azerbaijan'],
            ['GB', 'United Kingdom'],
        ]),
        priceTypes: selectOptions([
            ['fixed', 'Fixed price'],
            ['range', 'Price range'],
        ]),
        currencies: selectOptions([
            ['AZN', 'Azerbaijani manat (₼)'],
            ['GBP', 'Pound sterling (£)'],
        ]),
        serviceTypes: selectOptions([
            ['individual', 'One to one'],
            ['group', 'Group session'],
        ]),
        deliveryTypes: selectOptions([
            ['onsite', 'At the location'],
            ['online', 'Online'],
        ]),
        meetingProviders: selectOptions([['google_meet', 'Google Meet']]),
        google: { connected: false, email: null },
    },
    locations: {
        services: selectOptions([
            ['1', 'Deep Tissue Massage'],
            ['2', 'Gel Manicure'],
        ]),
        specialists: selectOptions([
            ['1', 'Leyla Hüseynova'],
            ['2', 'Səbinə Quliyeva'],
        ]),
        countries: selectOptions([
            ['AZ', 'Azerbaijan'],
            ['GB', 'United Kingdom'],
        ]),
    },
};

const slots = [
    {
        start: '2026-08-17T06:00:00Z',
        end: '2026-08-17T07:30:00Z',
        label: '10:00',
        available: true,
        remaining: null,
    },
    {
        start: '2026-08-17T06:30:00Z',
        end: '2026-08-17T08:00:00Z',
        label: '10:30',
        available: true,
        remaining: null,
    },
    {
        start: '2026-08-17T07:00:00Z',
        end: '2026-08-17T08:30:00Z',
        label: '11:00',
        available: false,
        remaining: null,
    },
];

type Form = 'appointment' | 'customer' | 'service' | 'location';

function Host({ open }: { open: Form }) {
    return (
        <QuickCreateForms
            open={open}
            onOpenChange={noop}
            options={options}
            timezone="Asia/Baku"
            availableSlots={slots}
            slotsLoading={false}
            onRequestSlots={noop}
        />
    );
}

/** `open="appointment"` mounts the appointment drawer over the dashboard. */
export function NewAppointment() {
    return <Host open="appointment" />;
}

/** `open="customer"` mounts the customer dialog instead — same host, one prop. */
export function NewCustomer() {
    return <Host open="customer" />;
}

/** `open="location"` mounts the location form modal. */
export function NewLocation() {
    return <Host open="location" />;
}

/** `open="service"` mounts the multi-step service wizard. */
export function NewService() {
    return <Host open="service" />;
}

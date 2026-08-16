import { ServicePicker } from 'uponco';

const noop = () => {};

function service(
    id: number,
    title: string,
    duration: number,
    price: string | null,
    description: string | null,
    categoryId: number | null,
    categoryName: string | null,
) {
    return {
        id,
        title,
        description,
        duration,
        price_type: price === null ? ('free' as const) : ('fixed' as const),
        price,
        price_min: null,
        price_max: null,
        currency: 'AZN' as const,
        delivery_type: 'onsite' as const,
        service_type: 'individual' as const,
        capacity: null,
        category_id: categoryId,
        category_name: categoryName,
        location_ids: [1, 2],
        specialist_ids: [1, 2],
    };
}

export function GroupedByCategory() {
    const groups = [
        {
            id: 1,
            name: 'Massage',
            services: [
                service(
                    1,
                    'Deep Tissue Massage',
                    60,
                    '75.00',
                    'Firm pressure for tight shoulders and lower back.',
                    1,
                    'Massage',
                ),
                service(
                    2,
                    'Hot Stone Therapy',
                    90,
                    '110.00',
                    'Heated basalt stones along the spine.',
                    1,
                    'Massage',
                ),
            ],
        },
        {
            id: 2,
            name: 'Nails',
            services: [
                service(
                    3,
                    'Gel Manicure',
                    45,
                    '40.00',
                    'Shellac finish, lasts up to three weeks.',
                    2,
                    'Nails',
                ),
                service(4, 'Classic Pedicure', 50, '45.00', null, 2, 'Nails'),
            ],
        },
    ];

    return (
        <div className="w-full max-w-md">
            <ServicePicker groups={groups} selectedId={1} onSelect={noop} />
        </div>
    );
}

export function UncategorizedList() {
    const groups = [
        {
            id: null,
            name: null,
            services: [
                service(
                    1,
                    'Deep Tissue Massage',
                    60,
                    '75.00',
                    'Firm pressure for tight shoulders and lower back.',
                    null,
                    null,
                ),
                service(
                    5,
                    'Aromatherapy Facial',
                    50,
                    '65.00',
                    'Cleanse, steam and a lavender oil massage.',
                    null,
                    null,
                ),
                service(
                    6,
                    'Consultation',
                    15,
                    null,
                    'A short chat before your first treatment.',
                    null,
                    null,
                ),
            ],
        },
    ];

    return (
        <div className="w-full max-w-md">
            <ServicePicker groups={groups} selectedId={null} onSelect={noop} />
        </div>
    );
}

export function NoServices() {
    return (
        <div className="w-full max-w-md rounded-xl border border-border">
            <ServicePicker groups={[]} selectedId={null} onSelect={noop} />
        </div>
    );
}

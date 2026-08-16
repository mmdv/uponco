import { Scissors } from 'lucide-react';
import { StepSelection } from 'uponco';

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
        title: 'Swedish Massage',
        description: 'A lighter, full-body relaxation massage.',
        duration: 60,
        price_type: 'fixed' as const,
        price: '80',
        price_min: null,
        price_max: null,
        currency: 'AZN' as const,
        delivery_type: 'onsite' as const,
        service_type: 'individual' as const,
        capacity: null,
        category_id: 1,
        category_name: 'Massage',
        location_ids: [1],
        specialist_ids: [1],
    },
    {
        id: 3,
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
        location_ids: [1, 2],
        specialist_ids: [2],
    },
];

const serviceGroups = [
    { id: 1, name: 'Massage', services: [services[0], services[1]] },
    { id: 2, name: 'Nails', services: [services[2]] },
];

const locations = [
    {
        id: 1,
        name: 'Nizami Studio',
        slug: 'nizami-studio',
        address: '28 Nizami küçəsi',
        city: 'Baku',
        phone: '+994 12 505 40 10',
        directions_url: null,
        is_geocoded: true,
        service_ids: [1, 2, 3],
        specialist_ids: [1, 2],
    },
    {
        id: 2,
        name: 'Port Baku Kiosk',
        slug: 'port-baku-kiosk',
        address: '153 Neftçilər prospekti',
        city: 'Baku',
        phone: '+994 12 505 40 11',
        directions_url: null,
        is_geocoded: true,
        service_ids: [1, 3],
        specialist_ids: [2],
    },
];

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
            slots: ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00'],
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
];

export function ChoosingAService() {
    return (
        <div className="w-full max-w-[420px]">
            <StepSelection
                openCard="service"
                onToggle={noop}
                serviceGroups={serviceGroups}
                locations={locations}
                specialists={specialists}
                serviceId={null}
                locationId={null}
                specialistId={null}
                locationVisible
                selectedService={null}
                selectedLocation={null}
                selectedSpecialist={null}
                locked={{
                    service: false,
                    location: false,
                    specialist: false,
                }}
                order={['service', 'specialist', 'location']}
                onServiceChange={noop}
                onLocationChange={noop}
                onSpecialistChange={noop}
                serviceIcon={Scissors}
            />
        </div>
    );
}

export function ServicePickedCardsCollapsed() {
    return (
        <div className="w-full max-w-[420px]">
            <StepSelection
                openCard={null}
                onToggle={noop}
                serviceGroups={serviceGroups}
                locations={locations}
                specialists={specialists}
                serviceId={1}
                locationId={1}
                specialistId={null}
                locationVisible
                selectedService={services[0]}
                selectedLocation={locations[0]}
                selectedSpecialist={null}
                locked={{
                    service: false,
                    location: false,
                    specialist: false,
                }}
                order={['service', 'location', 'specialist']}
                onServiceChange={noop}
                onLocationChange={noop}
                onSpecialistChange={noop}
                serviceIcon={Scissors}
            />
        </div>
    );
}

export function ChoosingASpecialist() {
    return (
        <div className="w-full max-w-[420px]">
            <StepSelection
                openCard="specialist"
                onToggle={noop}
                serviceGroups={serviceGroups}
                locations={locations}
                specialists={specialists}
                serviceId={1}
                locationId={1}
                specialistId={2}
                locationVisible
                selectedService={services[0]}
                selectedLocation={locations[0]}
                selectedSpecialist={specialists[1]}
                locked={{
                    service: false,
                    location: false,
                    specialist: false,
                }}
                order={['service', 'location', 'specialist']}
                onServiceChange={noop}
                onLocationChange={noop}
                onSpecialistChange={noop}
                serviceIcon={Scissors}
            />
        </div>
    );
}

export function EverythingLocked() {
    return (
        <div className="w-full max-w-[420px]">
            <StepSelection
                openCard={null}
                onToggle={noop}
                serviceGroups={[serviceGroups[0]]}
                locations={[locations[0]]}
                specialists={[specialists[0]]}
                serviceId={1}
                locationId={1}
                specialistId={1}
                locationVisible
                selectedService={services[0]}
                selectedLocation={locations[0]}
                selectedSpecialist={specialists[0]}
                locked={{ service: true, location: true, specialist: true }}
                order={['service', 'specialist', 'location']}
                onServiceChange={noop}
                onLocationChange={noop}
                onSpecialistChange={noop}
                serviceIcon={Scissors}
            />
        </div>
    );
}

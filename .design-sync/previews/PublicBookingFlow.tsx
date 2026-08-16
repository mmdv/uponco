import { PublicBookingFlow } from 'uponco';

const noop = () => {};

// A multi-service salon: the visitor lands on step one (selection) with every
// choice open. The flow drives its own state via useAppointmentBooking; no slot
// request fires until a date is picked, so this renders statically at step one.
const salonServices = [
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

const salonLocations = [
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

const salonSpecialists = [
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

// A phone-shaped shell so the header, scrolling step body and the sticky
// (embedded) footer stack the way they do on the real page.
const Frame = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto flex h-[760px] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border bg-card shadow-sm">
        {children}
    </div>
);

export function Landing() {
    return (
        <Frame>
            <PublicBookingFlow
                company={{
                    name: 'Studio Nur',
                    slug: 'studio-nur',
                    logo: null,
                    category: 'beauty_salon',
                    type: 'organisation',
                    headline: 'Studio Nur',
                    tagline: 'Massage & nails in central Baku',
                    brand: null,
                }}
                timezone="Asia/Baku"
                services={salonServices}
                locations={salonLocations}
                specialists={salonSpecialists}
                onThemeChange={noop}
                embedded
            />
        </Frame>
    );
}

export function SoloSpecialistBranded() {
    return (
        <Frame>
            <PublicBookingFlow
                company={{
                    name: 'Leyla Hüseynova',
                    slug: 'leyla-huseynova',
                    logo: null,
                    category: 'physiotherapy',
                    type: 'individual',
                    headline: 'Leyla Hüseynova',
                    tagline: 'Sports & remedial massage therapist',
                    brand: { primary: '#0f766e', accent: '#0f766e1a' },
                }}
                timezone="Asia/Baku"
                services={[salonServices[0]]}
                locations={[salonLocations[0]]}
                specialists={[salonSpecialists[0]]}
                onThemeChange={noop}
                embedded
            />
        </Frame>
    );
}

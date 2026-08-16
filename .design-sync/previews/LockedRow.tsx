import { MapPin, Scissors, User } from 'lucide-react';
import { LocationDetails, LockedRow } from 'uponco';

const NIZAMI = {
    id: 1,
    name: 'Nizami Street Studio',
    slug: 'nizami-street-studio',
    address: '28 Nizami Street, Sabail, Baku AZ1005',
    city: 'Baku',
    phone: '+994 12 493 88 20',
    directions_url: 'https://maps.google.com/?q=28+Nizami+Street+Baku',
    is_geocoded: true,
    service_ids: [1],
    specialist_ids: [1],
};

export function SoloSpecialist() {
    return (
        <div className="max-w-md">
            <LockedRow
                icon={User}
                title="Specialist"
                value="Ayla Rzayeva"
                onShowDetails={() => undefined}
                detailsLabel="About Ayla Rzayeva"
            />
        </div>
    );
}

export function PinnedLocationWithAddress() {
    return (
        <div className="max-w-md">
            <LockedRow
                icon={MapPin}
                title="Location"
                value="Nizami Street Studio"
                onShowDetails={() => undefined}
                detailsLabel="About Nizami Street Studio"
            >
                <LocationDetails location={NIZAMI} compact />
            </LockedRow>
        </div>
    );
}

export function StackedInTheBookingFlow() {
    return (
        <div className="max-w-md space-y-3">
            <LockedRow
                icon={Scissors}
                title="Service"
                value="Deep Tissue Massage · 60 min · ₼80"
            />
            <LockedRow
                icon={User}
                title="Specialist"
                value="Ayla Rzayeva"
                onShowDetails={() => undefined}
            />
            <LockedRow
                icon={MapPin}
                title="Location"
                value="Nizami Street Studio"
                onShowDetails={() => undefined}
            >
                <LocationDetails location={NIZAMI} compact />
            </LockedRow>
        </div>
    );
}

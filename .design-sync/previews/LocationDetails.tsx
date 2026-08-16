import { MapPin } from 'lucide-react';
import { LocationDetails } from 'uponco';

const NIZAMI = {
    id: 1,
    name: 'Nizami Street Studio',
    slug: 'nizami-street-studio',
    address: '28 Nizami Street, Sabail, Baku AZ1005',
    city: 'Baku',
    phone: '+994 12 493 88 20',
    directions_url: 'https://maps.google.com/?q=28+Nizami+Street+Baku',
    is_geocoded: true,
    service_ids: [1, 2, 3],
    specialist_ids: [1, 2],
};

const PORT_BAKU = {
    id: 2,
    name: 'Port Baku Kiosk',
    slug: 'port-baku-kiosk',
    address: '153 Neftchilar Avenue, Port Baku Mall, Level 2',
    city: 'Baku',
    phone: null,
    directions_url: null,
    is_geocoded: false,
    service_ids: [2],
    specialist_ids: [3],
};

export function InsideALocationCard() {
    return (
        <div className="max-w-md rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MapPin className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="truncate font-medium">{NIZAMI.name}</p>
                </div>
            </div>
            <LocationDetails location={NIZAMI} className="mt-3" />
        </div>
    );
}

export function AddressOnly() {
    return (
        <div className="max-w-md rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 font-medium">{PORT_BAKU.name}</p>
            <LocationDetails location={PORT_BAKU} />
        </div>
    );
}

export function CompactAndCentred() {
    return (
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-7" />
            </span>
            <p className="mt-3 text-lg font-semibold">{NIZAMI.name}</p>
            <LocationDetails
                location={NIZAMI}
                compact
                className="mt-2 text-center [&_div]:justify-center"
            />
        </div>
    );
}

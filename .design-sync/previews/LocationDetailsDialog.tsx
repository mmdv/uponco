import { useEffect } from 'react';
import { LocationDetailsDialog } from 'uponco';

/**
 * The dialog owns its own open state, so there is no `onOpenAutoFocus` to
 * prevent — Radix parks focus on the close button and the ring screenshots as
 * a rendering bug. Drop focus once the dialog has mounted.
 */
function useNoAutoFocusRing() {
    useEffect(() => {
        const id = window.setTimeout(() => {
            const active = document.activeElement;

            if (active instanceof HTMLElement) {
                active.blur();
            }
        }, 60);

        return () => window.clearTimeout(id);
    }, []);
}

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

const HOUSE_CALLS = {
    id: 3,
    name: 'Home visits — Yasamal',
    slug: 'home-visits-yasamal',
    address: null,
    city: 'Yasamal, Baku',
    phone: '+994 55 210 74 03',
    directions_url: null,
    is_geocoded: false,
    service_ids: [4],
    specialist_ids: [2],
};

export function BranchWithPhoneAndDirections() {
    useNoAutoFocusRing();

    return <LocationDetailsDialog location={NIZAMI} onClose={() => undefined} />;
}

export function BranchWithAddressOnly() {
    useNoAutoFocusRing();

    return (
        <LocationDetailsDialog location={PORT_BAKU} onClose={() => undefined} />
    );
}

export function MobileServiceAreaWithPhone() {
    useNoAutoFocusRing();

    return (
        <LocationDetailsDialog
            location={HOUSE_CALLS}
            onClose={() => undefined}
        />
    );
}

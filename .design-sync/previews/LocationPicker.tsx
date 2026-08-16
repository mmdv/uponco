import { LocationPicker } from 'uponco';

const noop = () => {};

const locations = [
    {
        id: 1,
        name: 'Nizami Studio',
        slug: 'nizami-studio',
        address: '28 May küç. 12, Nəsimi',
        city: 'Baku',
        phone: '+994 12 555 08 21',
        directions_url: 'https://maps.example.com/nizami-studio',
        is_geocoded: true,
        service_ids: [1, 2, 3],
        specialist_ids: [1, 2],
    },
    {
        id: 2,
        name: 'Port Baku Kiosk',
        slug: 'port-baku-kiosk',
        address: 'Neftçilər prospekti 153, Port Baku Mall',
        city: 'Baku',
        phone: '+994 12 555 44 09',
        directions_url: 'https://maps.example.com/port-baku-kiosk',
        is_geocoded: true,
        service_ids: [1, 3],
        specialist_ids: [3],
    },
];

export function TwoBranches() {
    return (
        <div className="w-full max-w-md">
            <LocationPicker
                locations={locations}
                selectedId={1}
                onSelect={noop}
            />
        </div>
    );
}

export function NothingSelectedYet() {
    return (
        <div className="w-full max-w-md space-y-3">
            <p className="text-sm font-medium">Where would you like to come?</p>
            <LocationPicker
                locations={locations}
                selectedId={null}
                onSelect={noop}
            />
        </div>
    );
}

export function SparseDetails() {
    return (
        <div className="w-full max-w-md">
            <LocationPicker
                locations={[
                    {
                        ...locations[0],
                        phone: null,
                        directions_url: null,
                    },
                    {
                        ...locations[1],
                        id: 3,
                        name: 'Yasamal Room',
                        address: null,
                        city: 'Baku',
                        directions_url: null,
                    },
                ]}
                selectedId={3}
                onSelect={noop}
            />
        </div>
    );
}

export function NoLocations() {
    return (
        <div className="w-full max-w-md rounded-xl border border-border">
            <LocationPicker locations={[]} selectedId={null} onSelect={noop} />
        </div>
    );
}

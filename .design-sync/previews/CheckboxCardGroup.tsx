import { CheckboxCardGroup, Label } from 'uponco';

const LOCATIONS = [
    {
        value: '1',
        label: 'Bella Salon — Nizami',
        description: '28 May küç. 12, Baku',
    },
    {
        value: '2',
        label: 'Bella Salon — Yasamal',
        description: 'Sharifzade küç. 4, Baku',
    },
    {
        value: '3',
        label: 'Bella Studio — Shoreditch',
        description: '18 Rivington St, London',
    },
    {
        value: '4',
        label: 'Home visits',
        description: 'Within 10 km of the salon',
    },
];

const SERVICES = [
    { value: 'balayage', label: 'Balayage', description: '2 h 30 · ₼120' },
    { value: 'gel-manicure', label: 'Gel Manicure', description: '45 min · ₼35' },
    {
        value: 'deep-tissue',
        label: 'Deep Tissue Massage',
        description: '60 min · ₼80',
    },
    { value: 'beard-trim', label: 'Beard Trim', description: '20 min · ₼15' },
];

export function LocationPicker() {
    return (
        <div className="grid max-w-2xl gap-2">
            <Label>Where can this service be booked?</Label>
            <CheckboxCardGroup
                options={LOCATIONS}
                value={['1', '3']}
                onChange={() => {}}
            />
        </div>
    );
}

export function AllSelected() {
    return (
        <div className="grid max-w-2xl gap-2">
            <Label>Services Leyla Aliyeva performs</Label>
            <CheckboxCardGroup
                options={SERVICES}
                value={SERVICES.map((service) => service.value)}
                onChange={() => {}}
            />
        </div>
    );
}

export function EmptyState() {
    return (
        <div className="grid max-w-md gap-2">
            <Label>Locations</Label>
            <CheckboxCardGroup
                options={[]}
                value={[]}
                onChange={() => {}}
                emptyMessage="Add a location before assigning specialists to one."
            />
        </div>
    );
}

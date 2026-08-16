import { Label, MultiSelect } from 'uponco';

const SPECIALISTS = [
    { value: '1', label: 'Leyla Aliyeva' },
    { value: '2', label: 'Rashad Guliyev' },
    { value: '3', label: 'Sevinc Alizade' },
    { value: '4', label: 'Nurlan Ismayilov' },
];

const SERVICES = [
    { value: 'balayage', label: 'Balayage' },
    { value: 'gel-manicure', label: 'Gel Manicure' },
    { value: 'deep-tissue', label: 'Deep Tissue Massage' },
    { value: 'beard-trim', label: 'Beard Trim' },
];

export function SpecialistFilter() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="specialists">Specialists</Label>
            <MultiSelect
                id="specialists"
                options={SPECIALISTS}
                value={['1', '3']}
                onChange={() => {}}
                placeholder="All specialists"
                searchPlaceholder="Search specialists…"
            />
        </div>
    );
}

export function EmptyPlaceholder() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="services">Services</Label>
            <MultiSelect
                id="services"
                options={SERVICES}
                value={[]}
                onChange={() => {}}
                placeholder="All services"
            />
        </div>
    );
}

export function InvalidAndDisabled() {
    return (
        <div className="grid w-80 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="services-invalid">
                    Services this specialist performs
                </Label>
                <MultiSelect
                    id="services-invalid"
                    options={SERVICES}
                    value={[]}
                    onChange={() => {}}
                    placeholder="Pick at least one service"
                    invalid
                />
                <p className="text-sm text-destructive">
                    Pick at least one service.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="locations-disabled">Locations</Label>
                <MultiSelect
                    id="locations-disabled"
                    options={[{ value: '1', label: 'Bella Salon — Nizami' }]}
                    value={['1']}
                    onChange={() => {}}
                    disabled
                />
            </div>
        </div>
    );
}

import { Checkbox, Label } from 'uponco';

export function ConsentRow() {
    return (
        <div className="flex items-start gap-3">
            <Checkbox id="booking-reminders" defaultChecked className="mt-0.5" />
            <div className="grid gap-1">
                <Label htmlFor="booking-reminders">
                    Send appointment reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                    Ayla gets an email 24 hours before her Deep Tissue Massage.
                </p>
            </div>
        </div>
    );
}

export function CheckedStates() {
    return (
        <div className="grid gap-4">
            <div className="flex items-center gap-3">
                <Checkbox id="state-unchecked" />
                <Label htmlFor="state-unchecked">Gel Manicure</Label>
            </div>
            <div className="flex items-center gap-3">
                <Checkbox id="state-checked" defaultChecked />
                <Label htmlFor="state-checked">Deep Tissue Massage</Label>
            </div>
            <div className="flex items-center gap-3">
                <Checkbox id="state-disabled" disabled />
                <Label htmlFor="state-disabled" className="opacity-50">
                    Hot Stone Therapy (archived)
                </Label>
            </div>
            <div className="flex items-center gap-3">
                <Checkbox id="state-disabled-checked" disabled defaultChecked />
                <Label htmlFor="state-disabled-checked" className="opacity-50">
                    Consultation (always included)
                </Label>
            </div>
        </div>
    );
}

export function ServiceFilterList() {
    const services = [
        { id: 'balayage', label: 'Balayage', checked: true },
        { id: 'gel-manicure', label: 'Gel Manicure', checked: true },
        { id: 'deep-tissue', label: 'Deep Tissue Massage', checked: false },
        { id: 'beard-trim', label: 'Beard Trim', checked: false },
    ];

    return (
        <div className="w-64 rounded-xl border p-3">
            <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">
                Filter by service
            </p>
            <div className="grid gap-1">
                {services.map((service) => (
                    <label
                        key={service.id}
                        className="flex items-center gap-3 rounded-lg px-1 py-2 text-sm"
                    >
                        <Checkbox defaultChecked={service.checked} />
                        {service.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

import { Label, OptionToggleGroup } from 'uponco';

export function ServiceType() {
    return (
        <div className="grid w-96 gap-2">
            <Label htmlFor="service-type">Service type</Label>
            <OptionToggleGroup
                id="service-type"
                value="individual"
                onChange={() => {}}
                options={[
                    { value: 'individual', label: 'Individual' },
                    { value: 'group', label: 'Group class' },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                One customer per slot, booked with a single specialist.
            </p>
        </div>
    );
}

export function PricingMode() {
    return (
        <div className="grid w-96 gap-2">
            <Label htmlFor="pricing-mode">Pricing</Label>
            <OptionToggleGroup
                id="pricing-mode"
                value="from"
                onChange={() => {}}
                options={[
                    { value: 'fixed', label: 'Fixed' },
                    { value: 'from', label: 'From' },
                    { value: 'free', label: 'Free' },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                Balayage &amp; Blow Dry shows as “from ₼120”.
            </p>
        </div>
    );
}

export function Invalid() {
    return (
        <div className="grid w-96 gap-2">
            <Label htmlFor="location-mode">Where does it take place?</Label>
            <OptionToggleGroup
                id="location-mode"
                value=""
                invalid
                onChange={() => {}}
                options={[
                    { value: 'salon', label: 'At the salon' },
                    { value: 'home', label: 'Home visit' },
                    { value: 'online', label: 'Online' },
                ]}
            />
            <p className="text-xs text-destructive">
                Pick where this service is delivered.
            </p>
        </div>
    );
}

import { Building2, CalendarClock, Layers, User, Video } from 'lucide-react';
import { ChoiceCard } from 'uponco';

const noop = () => {};

export function ServiceTypeChoice() {
    return (
        <div className="w-full max-w-md space-y-3" role="radiogroup">
            <ChoiceCard
                icon={User}
                title="One person at a time"
                description="A single customer books the slot — Deep Tissue Massage, Gel Manicure and the like."
                selected
                onSelect={noop}
            />
            <ChoiceCard
                icon={Layers}
                title="Group session"
                description="Several customers share one slot, such as a 12-place Pilates class."
                selected={false}
                onSelect={noop}
            />
        </div>
    );
}

export function DeliveryChoice() {
    return (
        <div className="w-full max-w-md space-y-3" role="radiogroup">
            <ChoiceCard
                icon={Building2}
                title="At one of your locations"
                description="Customers come to Nizami Studio or Port Baku Kiosk."
                selected={false}
                onSelect={noop}
            />
            <ChoiceCard
                icon={Video}
                title="Online"
                description="A video link is sent with the confirmation email."
                selected={false}
                onSelect={noop}
            />
            <ChoiceCard
                icon={CalendarClock}
                title="At the customer's address"
                description="Your specialist travels to them."
                selected={false}
                onSelect={noop}
                disabled
                badge="Coming soon"
            />
        </div>
    );
}

export function SelectedAndDisabled() {
    return (
        <div className="w-full max-w-md space-y-3" role="radiogroup">
            <ChoiceCard
                icon={User}
                title="Selected — individual service"
                description="Primary tint, tinted icon tile and a check mark in the top-right corner."
                selected
                onSelect={noop}
            />
            <ChoiceCard
                icon={Layers}
                title="Unselected — group service"
                description="Plain border, muted icon, no check mark."
                selected={false}
                onSelect={noop}
            />
            <ChoiceCard
                icon={Video}
                title="Disabled — home visits"
                description="Dimmed and unclickable until the feature ships."
                selected={false}
                onSelect={noop}
                disabled
                badge="Coming soon"
            />
        </div>
    );
}

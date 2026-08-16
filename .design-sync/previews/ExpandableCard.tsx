import { MapPin, Scissors, UserRound } from 'lucide-react';
import { ExpandableCard } from 'uponco';

const noop = () => {};

/** Open, with the service list inside — the first booking step's default. */
export function ChoosingAService() {
    return (
        <div className="w-full max-w-md">
            <ExpandableCard
                icon={Scissors}
                title="Service"
                hint="Choose what you're booking"
                open
                onToggle={noop}
            >
                <div className="space-y-2">
                    {[
                        {
                            name: 'Deep Tissue Massage',
                            meta: '90 min · 120 ₼',
                        },
                        { name: 'Swedish Massage', meta: '60 min · 80 ₼' },
                        { name: 'Gel Manicure', meta: '45 min · 45 ₼' },
                    ].map((service) => (
                        <div
                            key={service.name}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <span className="text-sm font-medium">
                                {service.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {service.meta}
                            </span>
                        </div>
                    ))}
                </div>
            </ExpandableCard>
        </div>
    );
}

/**
 * Collapsed with a choice made: the icon flips to a filled check and the hint is
 * replaced by the selected label.
 */
export function CollapsedWithSelection() {
    return (
        <div className="w-full max-w-md">
            <ExpandableCard
                icon={UserRound}
                title="Specialist"
                hint="Anyone available"
                selectedLabel="Leyla Hüseynova · Senior massage therapist"
                open={false}
                onToggle={noop}
            >
                <p className="text-sm text-muted-foreground">
                    Pick who you would like to see.
                </p>
            </ExpandableCard>
        </div>
    );
}

/** The three cards stacked as the booking step actually renders them. */
export function BookingStepStack() {
    return (
        <div className="flex w-full max-w-md flex-col gap-3">
            <ExpandableCard
                icon={Scissors}
                title="Service"
                hint="Choose what you're booking"
                selectedLabel="Deep Tissue Massage · 90 min"
                open={false}
                onToggle={noop}
            >
                <p className="text-sm text-muted-foreground">Services</p>
            </ExpandableCard>
            <ExpandableCard
                icon={MapPin}
                title="Location"
                hint="Where should we see you?"
                open
                onToggle={noop}
            >
                <div className="space-y-2">
                    {[
                        {
                            name: 'Nizami Studio',
                            address: '28 Nizami küçəsi, Baku',
                        },
                        {
                            name: 'Port Baku Kiosk',
                            address: '153 Neftçilər prospekti, Baku',
                        },
                    ].map((location) => (
                        <div
                            key={location.name}
                            className="rounded-lg border p-3"
                        >
                            <p className="text-sm font-medium">
                                {location.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {location.address}
                            </p>
                        </div>
                    ))}
                </div>
            </ExpandableCard>
            <ExpandableCard
                icon={UserRound}
                title="Specialist"
                hint="Anyone available"
                open={false}
                onToggle={noop}
            >
                <p className="text-sm text-muted-foreground">Specialists</p>
            </ExpandableCard>
        </div>
    );
}

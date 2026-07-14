import { usePage } from '@inertiajs/react';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import LocationFormDrawer from '@/components/locations/location-form-drawer';
import { Button } from '@/components/ui/button';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['locations'];
    controls: StepControls;
};

export default function StepLocations({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [drawerOpen, setDrawerOpen] = useState(false);

    const hasLocations = data.locations.length > 0;

    return (
        <div className="space-y-6">
            {hasLocations ? (
                <div className="space-y-3">
                    {data.locations.map((location) => (
                        <div
                            key={location.id}
                            className="flex items-center gap-3 rounded-lg border p-4"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="font-medium">
                                    {location.name || 'Location'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {[location.city, location.country]
                                        .filter(Boolean)
                                        .join(', ') || 'No address yet'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <Button
                type="button"
                variant="outline"
                onClick={() => setDrawerOpen(true)}
                data-test="onboarding-add-location"
            >
                <Plus className="h-4 w-4" />
                {hasLocations ? 'Add another location' : 'Add location'}
            </Button>

            <LocationFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                location={null}
                teamSlug={teamSlug}
                services={data.services}
                specialists={data.specialists}
                countries={data.countries}
            />

            <OnboardingFooter
                showBack={controls.showBack}
                onBack={controls.onBack}
                saving={controls.saving}
                onSkip={controls.onSkip}
                skipLabel="I service online"
                onContinue={controls.onComplete}
                continueDisabled={!hasLocations}
            />
        </div>
    );
}

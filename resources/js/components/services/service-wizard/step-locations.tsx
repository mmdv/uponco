import { MapPin, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import LocationFormDrawer from '@/components/locations/location-form-drawer';
import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import { useTranslation } from '@/hooks/use-translation';
import type { SelectOption } from '@/types';

/**
 * Onsite branch step: an onsite service must be offered in at least one
 * branch, so the location choice comes before the rest of the details.
 */
export default function StepLocations({
    teamSlug,
    locations,
    services,
    specialists,
    countries,
    value,
    onChange,
}: {
    teamSlug: string;
    locations: SelectOption[];
    services: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
}) {
    const { t } = useTranslation('company');

    const [drawerOpen, setDrawerOpen] = useState(false);
    // Saving a location reloads the page props, so anything that appears while
    // the drawer is open was just created here and is ticked automatically.
    const knownIds = useRef<string[] | null>(null);

    useEffect(() => {
        if (knownIds.current === null) {
            return;
        }

        const created = locations
            .map((location) => location.value)
            .filter((id) => !knownIds.current?.includes(id));

        if (created.length === 0) {
            return;
        }

        knownIds.current = null;
        onChange([...value, ...created]);
    }, [locations, value, onChange]);

    const openDrawer = () => {
        knownIds.current = locations.map((location) => location.value);
        setDrawerOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium">
                    {t('services.wizard.locations.heading')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t('services.wizard.locations.subheading')}
                </p>
            </div>

            {locations.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
                    <MapPin className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        {t('services.wizard.locations.empty')}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openDrawer}
                        data-test="wizard-add-location-button"
                    >
                        <Plus />
                        {t('services.wizard.locations.addLocation')}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <CheckboxCardGroup
                        options={locations}
                        value={value}
                        onChange={onChange}
                        data-test="wizard-locations-select"
                    />
                    <p className="text-sm text-muted-foreground">
                        {t('services.form.locationsHint')}
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={openDrawer}
                        data-test="wizard-add-location-button"
                    >
                        <Plus />
                        {t('services.wizard.locations.addAnotherLocation')}
                    </Button>
                </div>
            )}

            <LocationFormDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                location={null}
                teamSlug={teamSlug}
                services={services}
                specialists={specialists}
                countries={countries}
            />
        </div>
    );
}

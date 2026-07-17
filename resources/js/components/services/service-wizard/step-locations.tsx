import { Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CheckboxCardGroup } from '@/components/ui/checkbox-card-group';
import { useTranslation } from '@/hooks/use-translation';
import { index as locationsIndex } from '@/routes/company/locations';
import type { SelectOption } from '@/types';

/**
 * Onsite branch step: an onsite service must be offered in at least one
 * branch, so the location choice comes before the rest of the details.
 */
export default function StepLocations({
    teamSlug,
    locations,
    value,
    onChange,
}: {
    teamSlug: string;
    locations: SelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
}) {
    const { t } = useTranslation('company');

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
                    <Button asChild variant="outline">
                        <Link href={locationsIndex(teamSlug)}>
                            {t('services.wizard.locations.manageLink')}
                        </Link>
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
                </div>
            )}
        </div>
    );
}

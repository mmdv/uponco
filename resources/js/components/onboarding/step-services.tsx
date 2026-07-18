import { usePage } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import ServiceWizardFields from '@/components/services/service-wizard/service-wizard-fields';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['services'];
    controls: StepControls;
};

export default function StepServices({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    // Bumping the key remounts the wizard, so creating a service leaves a clean
    // form behind for the next one instead of the previous answers.
    const [wizardKey, setWizardKey] = useState(0);

    const hasServices = data.services.length > 0;

    return (
        <div className="space-y-6">
            {hasServices ? (
                <div className="space-y-2">
                    {data.services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="text-sm font-medium">
                                {service.title}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {service.duration} min
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Rendered flush against the step card: the wizard is the step,
                not a component nested inside it. */}
            <ServiceWizardFields
                key={wizardKey}
                inline
                defaultCategoryId={null}
                teamSlug={teamSlug}
                categories={data.categories}
                locations={data.locations}
                serviceOptions={data.serviceOptions}
                specialists={data.specialists}
                countries={data.countries}
                priceTypes={data.priceTypes}
                serviceTypes={data.serviceTypes}
                google={data.google}
                onSuccess={() => setWizardKey((key) => key + 1)}
            />

            <OnboardingFooter
                showBack={controls.showBack}
                onBack={controls.onBack}
                saving={controls.saving}
                onSkip={controls.onSkip}
                onContinue={controls.onComplete}
                continueDisabled={!hasServices}
            />
        </div>
    );
}

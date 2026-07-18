import { usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, Plus } from 'lucide-react';
import { useState } from 'react';
import ServiceWizardDialog from '@/components/services/service-wizard/service-wizard-dialog';
import ServiceWizardFields from '@/components/services/service-wizard/service-wizard-fields';
import { Button } from '@/components/ui/button';
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

    const [dialogOpen, setDialogOpen] = useState(false);

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
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
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

            {hasServices ? (
                /* The step is satisfied, so the wizard gets out of the way —
                   continuing is the primary path and anything else can wait
                   until after onboarding. */
                <div className="space-y-3 rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        That's all you need to start taking bookings. You can
                        add more services any time from your dashboard.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(true)}
                        data-test="onboarding-add-another-service"
                    >
                        <Plus />
                        Add another service
                    </Button>
                </div>
            ) : (
                /* Rendered flush against the step card: the wizard is the step,
                   not a component nested inside it. */
                <ServiceWizardFields
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
                    onSuccess={() => undefined}
                />
            )}

            <ServiceWizardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
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

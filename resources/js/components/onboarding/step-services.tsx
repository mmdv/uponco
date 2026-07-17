import { usePage } from '@inertiajs/react';
import { Plus, Tag, Video } from 'lucide-react';
import { useState } from 'react';
import GoogleMeetCard from '@/components/integrations/google-meet-card';
import CategoryFormDialog from '@/components/services/category-form-dialog';
import ServiceFormDrawer from '@/components/services/service-form-drawer';
import { Badge } from '@/components/ui/badge';
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

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [serviceOpen, setServiceOpen] = useState(false);

    const hasServices = data.services.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                {data.categories.map((category) => (
                    <Badge
                        key={category.id}
                        variant="secondary"
                        className="gap-1"
                    >
                        <Tag className="h-3 w-3" />
                        {category.name}
                    </Badge>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryOpen(true)}
                    data-test="onboarding-add-category"
                >
                    <Plus className="h-4 w-4" /> Add category
                </Button>
            </div>

            {hasServices ? (
                <div className="space-y-3">
                    {data.services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="font-medium">{service.title}</div>
                            <div className="text-sm text-muted-foreground">
                                {service.duration} min
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <Button
                type="button"
                variant="outline"
                onClick={() => setServiceOpen(true)}
                data-test="onboarding-add-service"
            >
                <Plus className="h-4 w-4" />
                {hasServices ? 'Add another service' : 'Add service'}
            </Button>

            <CategoryFormDialog
                open={categoryOpen}
                onOpenChange={setCategoryOpen}
                category={null}
                teamSlug={teamSlug}
            />

            <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Online services? Add automatic meeting links
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Connect your Google account and every online booking
                            gets a Google Meet link created for you. We support
                            Google Meet for now — more providers are on the way.
                        </p>
                    </div>
                </div>

                <GoogleMeetCard google={data.google} />
            </div>

            <ServiceFormDrawer
                open={serviceOpen}
                onOpenChange={setServiceOpen}
                service={null}
                defaultCategoryId={null}
                teamSlug={teamSlug}
                categories={data.categories}
                locations={data.locations}
                specialists={data.specialists}
                priceTypes={data.priceTypes}
                serviceTypes={data.serviceTypes}
                deliveryTypes={data.deliveryTypes}
                meetingProviders={data.meetingProviders}
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

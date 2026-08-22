import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import ServiceFormDrawer from '@/components/services/service-form-drawer';
import { ServiceFormInputs } from '@/components/services/service-wizard/service-draft';
import type { ServiceDraftControls } from '@/components/services/service-wizard/service-draft';
import ServiceWizardDialog from '@/components/services/service-wizard/service-wizard-dialog';
import StepDetails from '@/components/services/service-wizard/step-details';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/routes/company/services';
import type { Onboarding, SelectOption, Service } from '@/types';

import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import OnboardingScreen, {
    ScreenBody,
    ScreenFooterBar,
} from './onboarding-screen';
import ScreenHeader from './screen-header';
import ServiceSummaryCard from './service-summary-card';

type Props = {
    data: Onboarding['services'];
    service: ServiceDraftControls;
    controls: StepControls;
};

/**
 * The last of the three service screens, and the one that actually creates it —
 * delivery and locations were only collected in state until now.
 *
 * Once the first service is saved the form gives way to a review of everything
 * created so far: the user can edit a service, add more, or continue — mirroring
 * the location screen rather than jumping straight to the next step.
 *
 * The specialist is the person setting the team up, so that picker is hidden;
 * extra specialists are assigned later from the services page.
 */
export default function ScreenDetails({ data, service, controls }: Props) {
    // Creating the service reloads the props with it in `data.services`, which
    // flips the screen from the form to the review — no local flag to keep in
    // sync, mirroring the location screen's empty-vs-picker split.
    if (data.services.length > 0) {
        return <ReviewServices data={data} controls={controls} />;
    }

    return (
        <CreateFirstService data={data} service={service} controls={controls} />
    );
}

/** The wizard's final form, which creates the first service. */
function CreateFirstService({ data, service, controls }: Props) {
    const { t } = useTranslation('company');

    // Nothing is flagged until the user asks to create the service, so the
    // screen opens clean instead of complaining about untouched fields.
    const [submitted, setSubmitted] = useState(false);

    // A category is optional, so leaving it unset is an explicit choice rather
    // than an empty field. The blank value submits as null.
    const categoryOptions: SelectOption[] = [
        { value: '', label: t('services.form.categoryNone') },
        ...data.categories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
        })),
    ];

    return (
        <Form
            {...store.form()}
            options={{ preserveScroll: true }}
            onBefore={() => setSubmitted(true)}
            className="flex min-h-full flex-1 flex-col"
            disableWhileProcessing
        >
            {({ errors, processing }) => (
                <>
                    <ServiceFormInputs draft={service.draft} />

                    <ScreenBody>
                        <ScreenHeader
                            title="Tell us about your service"
                            description="This is what customers see and book."
                        />

                        <StepDetails
                            details={service.draft.details}
                            onPatch={service.patchDetails}
                            summary={null}
                            onEditDelivery={() => undefined}
                            categoryOptions={categoryOptions}
                            specialists={data.specialists}
                            priceTypes={data.priceTypes}
                            currencies={data.currencies}
                            serviceTypes={data.serviceTypes}
                            errors={submitted ? errors : {}}
                            showSpecialists={false}
                            collapseAdvanced
                        />
                    </ScreenBody>

                    <ScreenFooterBar>
                        {/*
                         * Always enabled: pressing Continue submits and lets the
                         * server flag whatever required fields are missing,
                         * rather than silently blocking on an empty title.
                         */}
                        <OnboardingFooter
                            saving={processing || controls.saving}
                        />
                    </ScreenFooterBar>
                </>
            )}
        </Form>
    );
}

type ReviewProps = {
    data: Onboarding['services'];
    controls: StepControls;
};

/**
 * Review the created service(s), reopening the same add wizard and edit drawer
 * the dashboard uses, before completing the step.
 */
function ReviewServices({ data, controls }: ReviewProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);

    // The wizard's location step attaches existing services, so it needs the
    // same value/label option list the dashboard passes.
    const serviceOptions: SelectOption[] = data.services.map((item) => ({
        value: item.id.toString(),
        label: item.title,
    }));

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter
                    saving={controls.saving}
                    onClick={controls.onComplete}
                />
            }
        >
            <ScreenHeader
                title="Your services"
                description="Review what you offer, then continue. You can add more or edit anytime."
            />

            <div className="space-y-4">
                {data.services.map((item) => (
                    <ServiceSummaryCard
                        key={item.id}
                        service={item}
                        onEdit={() => setEditing(item)}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(true)}
                data-test="onboarding-add-service-button"
            >
                <Plus />
                Add another service
            </Button>

            <ServiceWizardDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                defaultCategoryId={null}
                categories={data.categories}
                locations={data.locations}
                serviceOptions={serviceOptions}
                specialists={data.specialists}
                countries={data.countries}
                priceTypes={data.priceTypes}
                currencies={data.currencies}
                serviceTypes={data.serviceTypes}
                google={data.google}
            />

            <ServiceFormDrawer
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditing(null);
                    }
                }}
                service={editing}
                defaultCategoryId={null}
                categories={data.categories}
                locations={data.locations}
                specialists={data.specialists}
                priceTypes={data.priceTypes}
                currencies={data.currencies}
                serviceTypes={data.serviceTypes}
                deliveryTypes={data.deliveryTypes}
                meetingProviders={data.meetingProviders}
            />
        </OnboardingScreen>
    );
}

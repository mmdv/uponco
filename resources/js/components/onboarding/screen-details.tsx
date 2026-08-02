import { Form } from '@inertiajs/react';
import { useState } from 'react';

import { ServiceFormInputs } from '@/components/services/service-wizard/service-draft';
import type { ServiceDraftControls } from '@/components/services/service-wizard/service-draft';
import StepDetails from '@/components/services/service-wizard/step-details';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/routes/company/services';
import type { Onboarding, SelectOption } from '@/types';

import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';
import { ScreenBody, ScreenFooterBar } from './onboarding-screen';
import ScreenHeader from './screen-header';

type Props = {
    data: Onboarding['services'];
    service: ServiceDraftControls;
    controls: StepControls;
};

/**
 * The last of the three service screens, and the one that actually creates it —
 * delivery and locations were only collected in state until now.
 *
 * The specialist is the person setting the team up, so that picker is hidden;
 * extra specialists are assigned later from the services page.
 */
export default function ScreenDetails({ data, service, controls }: Props) {
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
            onSuccess={controls.onComplete}
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
                        <OnboardingFooter
                            saving={processing || controls.saving}
                            disabled={service.draft.details.title.trim() === ''}
                        />
                    </ScreenFooterBar>
                </>
            )}
        </Form>
    );
}

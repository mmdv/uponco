import StepDelivery from '@/components/services/service-wizard/step-delivery';
import type { DeliveryType } from '@/types';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

/**
 * The first real decision of the flow: it picks the screen that follows —
 * an address for onsite, meeting links for online.
 */
export default function ScreenDelivery({
    value,
    onChange,
    onNext,
}: {
    value: DeliveryType | '';
    onChange: (value: DeliveryType) => void;
    onNext: () => void;
}) {
    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter disabled={value === ''} onClick={onNext} />
            }
        >
            <ScreenHeader
                title="How do you meet customers?"
                description="This decides how they attend their appointment."
            />

            <StepDelivery
                value={value}
                onChange={onChange}
                showHeading={false}
            />
        </OnboardingScreen>
    );
}

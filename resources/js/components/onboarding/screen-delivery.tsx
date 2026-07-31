import StepDelivery from '@/components/services/service-wizard/step-delivery';
import type { DeliveryType } from '@/types';

import OnboardingFooter from './onboarding-footer';
import OnboardingScreen from './onboarding-screen';
import ScreenHeader from './screen-header';

/**
 * Online services are built but not launched, so the choice is presented in
 * full and the online branch is marked as coming soon.
 */
const COMING_SOON: DeliveryType[] = ['online'];

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
                disabled={COMING_SOON}
                showHeading={false}
            />
        </OnboardingScreen>
    );
}

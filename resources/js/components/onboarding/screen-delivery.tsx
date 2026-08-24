import StepDelivery from '@/components/services/service-wizard/step-delivery';
import { useTranslation } from '@/hooks/use-translation';
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
    const { t } = useTranslation('onboard');

    return (
        <OnboardingScreen
            footer={
                <OnboardingFooter disabled={value === ''} onClick={onNext} />
            }
        >
            <ScreenHeader
                title={t('delivery.title')}
                description={t('delivery.description')}
            />

            <StepDelivery
                value={value}
                onChange={onChange}
                showHeading={false}
            />
        </OnboardingScreen>
    );
}

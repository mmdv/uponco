import { Head } from '@inertiajs/react';

import OnboardingWizard from '@/components/onboarding/onboarding-wizard';
import TermsConsentDialog from '@/components/terms-consent-dialog';
import { useTranslation } from '@/hooks/use-translation';
import type { Onboarding } from '@/types';

export default function OnboardingPage(props: Onboarding) {
    const { t } = useTranslation('onboard');

    return (
        <>
            <Head title={t('headTitle')} />
            <OnboardingWizard onboarding={props} />

            {/* The setup flow renders without the app shell, so the consent
                dialog has to be mounted here too — otherwise someone who has
                not finished setting up could never be asked. */}
            <TermsConsentDialog />
        </>
    );
}

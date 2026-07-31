import { Head } from '@inertiajs/react';

import OnboardingWizard from '@/components/onboarding/onboarding-wizard';
import type { Onboarding } from '@/types';

export default function OnboardingPage(props: Onboarding) {
    return (
        <>
            <Head title="Set up your business" />
            <OnboardingWizard onboarding={props} />
        </>
    );
}

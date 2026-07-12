import type { Location, SelectOption } from './locations';
import type { Service, ServiceCategory } from './services';

export type OnboardingStepKey = 'locations' | 'services' | 'profile';

export type OnboardingStepStatus = 'pending' | 'completed' | 'skipped';

export type OnboardingStepInfo = {
    key: OnboardingStepKey;
    label: string;
    status: OnboardingStepStatus;
    mandatory: boolean;
};

export type OnboardingProfile = {
    name: string;
    email: string | null;
    phone: string | null;
    job_title: string | null;
    description: string | null;
};

export type Onboarding = {
    currentStep: OnboardingStepKey;
    steps: OnboardingStepInfo[];
    locations: {
        locations: Location[];
        services: SelectOption[];
        specialists: SelectOption[];
        countries: SelectOption[];
    };
    services: {
        categories: ServiceCategory[];
        services: Service[];
        locations: SelectOption[];
        specialists: SelectOption[];
        priceTypes: SelectOption[];
        serviceTypes: SelectOption[];
        deliveryTypes: SelectOption[];
        meetingProviders: SelectOption[];
    };
    profile: OnboardingProfile;
};

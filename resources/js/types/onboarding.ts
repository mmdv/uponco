import type { SelectOption } from './locations';
import type { ScheduleMember, ScheduleSlotMap } from './schedule';
import type { Service, ServiceCategory } from './services';

export type OnboardingStepKey = 'services' | 'profile' | 'schedule';

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

export type GoogleIntegrationStatus = {
    connected: boolean;
    email: string | null;
};

export type Onboarding = {
    currentStep: OnboardingStepKey;
    steps: OnboardingStepInfo[];
    services: {
        categories: ServiceCategory[];
        services: Service[];
        serviceOptions: SelectOption[];
        locations: SelectOption[];
        specialists: SelectOption[];
        countries: SelectOption[];
        priceTypes: SelectOption[];
        currencies: SelectOption[];
        serviceTypes: SelectOption[];
        google: GoogleIntegrationStatus;
    };
    profile: OnboardingProfile;
    schedule: {
        members: ScheduleMember[];
        slots: ScheduleSlotMap;
    };
};

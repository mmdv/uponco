import type { Location, SelectOption } from './locations';
import type { ScheduleMember, ScheduleSlotMap } from './schedule';
import type { Service, ServiceCategory } from './services';

export type OnboardingStepKey =
    | 'locations'
    | 'services'
    | 'profile'
    | 'schedule';

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
        google: GoogleIntegrationStatus;
    };
    profile: OnboardingProfile;
    schedule: {
        members: ScheduleMember[];
        slots: ScheduleSlotMap;
    };
};

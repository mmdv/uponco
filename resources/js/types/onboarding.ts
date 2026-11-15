import type { Location, SelectOption } from './locations';
import type { DayScheduleMap } from './schedule';
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

/** The AI assistants (Claude, ChatGPT, …) connected to the user's account through the MCP server. */
export type AiAssistantsStatus = {
    /** The address assistants connect to (`/mcp`). */
    serverUrl: string;
    connected: {
        /** One of the app's OAuth clients; disconnecting revokes all of them. */
        client_id: string;
        name: string;
        last_active_at: string;
    }[];
};

export type Onboarding = {
    /** Every step is resolved; only the closing screen is left to show. */
    completed: boolean;
    currentStep: OnboardingStepKey;
    steps: OnboardingStepInfo[];
    services: {
        categories: ServiceCategory[];
        services: Service[];
        serviceOptions: SelectOption[];
        locations: SelectOption[];
        /** Full records for each location, for edit modals and detail cards. */
        locationDetails: Location[];
        specialists: SelectOption[];
        countries: SelectOption[];
        priceTypes: SelectOption[];
        currencies: SelectOption[];
        serviceTypes: SelectOption[];
        deliveryTypes: SelectOption[];
        meetingProviders: SelectOption[];
        google: GoogleIntegrationStatus;
    };
    profile: OnboardingProfile;
    /** The user's own slots for the range on screen; absent while reloading. */
    schedule?: DayScheduleMap;
    /** Whether any work hours are saved, which is what the step requires. */
    hasSchedule: boolean;
};

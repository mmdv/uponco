import type {
    Appointment,
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from './appointments';
import type { SelectOption } from './locations';
import type { GoogleIntegrationStatus } from './onboarding';
import type { ServiceCategory } from './services';

export type DashboardStats = {
    customers: number;
    totalBookings: number;
    upcoming: number;
    services: number;
    locations: number;
};

export type DashboardTrendDay = {
    label: string;
    date: string;
    count: number;
    isToday: boolean;
};

export type UpcomingAppointment = Appointment;

export type DashboardFormOptions = {
    appointments: {
        services: AppointmentServiceOption[];
        locations: AppointmentLocationOption[];
        specialists: AppointmentSpecialistOption[];
    };
    services: {
        categories: ServiceCategory[];
        services: SelectOption[];
        locations: SelectOption[];
        specialists: SelectOption[];
        countries: SelectOption[];
        priceTypes: SelectOption[];
        serviceTypes: SelectOption[];
        deliveryTypes: SelectOption[];
        meetingProviders: SelectOption[];
        google: GoogleIntegrationStatus;
    };
    locations: {
        services: SelectOption[];
        specialists: SelectOption[];
        countries: SelectOption[];
    };
};

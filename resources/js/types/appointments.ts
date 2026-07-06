import type { DeliveryType, PriceType, ServiceTypeValue } from './services';

export type AppointmentServiceOption = {
    id: number;
    title: string;
    description: string | null;
    duration: number;
    price_type: PriceType;
    price: string | null;
    price_min: string | null;
    price_max: string | null;
    delivery_type: DeliveryType;
    service_type: ServiceTypeValue;
    capacity: number | null;
    category_id: number;
    category_name: string;
    location_ids: number[];
    specialist_ids: number[];
};

export type AppointmentLocationOption = {
    id: number;
    name: string;
    service_ids: number[];
    specialist_ids: number[];
};

export type SpecialistAvailabilityPreview = {
    /** `YYYY-MM-DD` of the nearest working day. */
    date: string;
    /** Human label for that day, e.g. "Today", "Tomorrow" or "Mon, 24 Jun". */
    label: string;
    /** A few half-hour start labels (HH:MM) across that day's work window. */
    slots: string[];
};

export type AppointmentSpecialistOption = {
    id: number;
    name: string;
    avatar?: string | null;
    service_ids: number[];
    location_ids: number[];
    next_available: SpecialistAvailabilityPreview | null;
    /** `YYYY-MM-DD` days within the next two weeks that have a free slot. */
    available_days: string[];
};

export type AppointmentSlot = {
    /** ISO-8601 UTC instant of the slot start. */
    start: string;
    /** ISO-8601 UTC instant of the slot end. */
    end: string;
    /** Wall-clock start time (HH:MM) in the team timezone. */
    label: string;
    available: boolean;
    /** Seats left for a group service, or null for individual services. */
    remaining: number | null;
};

export type Appointment = {
    id: number;
    start_at: string;
    end_at: string;
    timezone: string;
    notes: string | null;
    service: { id: number; title: string };
    location: { id: number; name: string } | null;
    specialist: { id: number; name: string };
    customer: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
    };
    service_id: number;
    location_id: number | null;
    specialist_id: number;
};

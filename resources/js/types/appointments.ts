import type {
    CurrencyCode,
    DeliveryType,
    PriceType,
    ServiceTypeValue,
} from './services';

export type AppointmentServiceOption = {
    id: number;
    title: string;
    description: string | null;
    duration: number;
    price_type: PriceType;
    price: string | null;
    price_min: string | null;
    price_max: string | null;
    currency: CurrencyCode;
    delivery_type: DeliveryType;
    service_type: ServiceTypeValue;
    capacity: number | null;
    category_id: number | null;
    category_name: string | null;
    location_ids: number[];
    specialist_ids: number[];
};

export type AppointmentLocationOption = {
    id: number;
    name: string;
    service_ids: number[];
    specialist_ids: number[];
};

/**
 * A location with the public-facing detail the v2 booking page shows while (and
 * after) choosing. Superset of {@link AppointmentLocationOption}, so anything
 * accepting the base option accepts this too.
 */
export type AppointmentLocationDetail = AppointmentLocationOption & {
    slug: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    directions_url: string | null;
    is_geocoded: boolean;
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
    job_title?: string | null;
    description?: string | null;
    service_ids: number[];
    location_ids: number[];
    /** Effective appointment duration (minutes) per offered service id. */
    service_durations: Record<string, number>;
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

/** A specialist's working window on a day, as `HH:MM` wall-clock times. */
export type WorkingWindow = { start: string; end: string };

/**
 * The viewed day's working windows keyed by specialist id (as a string, since
 * it arrives as a JSON object). A specialist absent from the map is off that day.
 */
export type WorkingHoursMap = Record<string, WorkingWindow[]>;

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
        id: number | null;
        name: string;
        email: string | null;
        phone: string | null;
    };
    service_id: number;
    location_id: number | null;
    specialist_id: number;
};

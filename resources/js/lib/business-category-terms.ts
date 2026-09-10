/**
 * The noun a business uses for the people it serves. A clinic has patients, a
 * salon has clients, a tutor has students; everyone else falls back to the
 * generic "customer".
 */
export type CustomerTermKey = 'customer' | 'client' | 'patient' | 'student';

/** The term used when a business has no category or picked one not mapped here. */
export const DEFAULT_CUSTOMER_TERM: CustomerTermKey = 'customer';

/**
 * A customer noun per business category, keyed by the value of the backend's
 * `App\Enums\BusinessCategory`. A category without an entry falls back to the
 * default term rather than breaking the UI, so adding a case to the enum is
 * never a hard dependency on touching this file.
 */
const BUSINESS_CATEGORY_CUSTOMER_TERMS: Record<string, CustomerTermKey> = {
    // Health & medical — and vets, whose booker is the animal's owner.
    medical_clinic: 'client',
    dental_clinic: 'client',
    physiotherapy: 'client',
    nutritionist: 'client',
    optician: 'client',
    chiropractor: 'client',
    speech_therapy: 'client',
    alternative_medicine: 'client',
    veterinary_clinic: 'client',

    // Mental health & coaching.
    psychologist: 'client',
    psychotherapist: 'client',
    counsellor: 'client',
    life_coach: 'client',

    // Hair & barbering.
    hairdresser: 'client',
    barbershop: 'client',

    // Beauty & skincare.
    beauty_salon: 'client',
    nail_salon: 'client',
    lashes_brows: 'client',
    makeup_artist: 'client',
    skin_care_clinic: 'client',
    hair_removal: 'client',
    tattoo_studio: 'client',
    piercing_studio: 'client',

    // Wellness & spa.
    massage_salon: 'client',
    spa: 'client',

    // Fitness & sport.
    fitness: 'client',
    yoga_studio: 'client',
    pilates_studio: 'client',
    dance_studio: 'client',
    sports_coaching: 'client',

    // Professional services.
    consulting: 'client',
    photography: 'client',
    legal_services: 'client',
    accounting: 'client',
    real_estate: 'client',
    event_planning: 'client',
    design_creative: 'client',

    // Pets (the owner is the client).
    pet_grooming: 'client',
    dog_training: 'client',

    // Education.
    online_tutoring: 'student',
    private_tutoring: 'student',
    language_school: 'student',
    music_lessons: 'student',
    driving_school: 'student',

    // Home & auto and the catch-all keep the generic term.
    automotive_repair: 'customer',
    car_wash: 'customer',
    cleaning_services: 'customer',
    handyman: 'customer',
    other: 'customer',
};

/** Resolve the customer-noun key for a business category value. */
export function customerTermKey(category?: string | null): CustomerTermKey {
    return (
        (category ? BUSINESS_CATEGORY_CUSTOMER_TERMS[category] : undefined) ??
        DEFAULT_CUSTOMER_TERM
    );
}

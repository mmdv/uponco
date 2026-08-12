import { useState } from 'react';

import type { WizardDetails } from '@/components/services/service-wizard/step-details';
import { useLocale } from '@/hooks/use-translation';
import { defaultCurrencyForLocale } from '@/lib/currency';
import type { DeliveryType } from '@/types';

/**
 * Everything needed to create a service, collected across several screens
 * before a single submit at the end.
 */
export type ServiceDraft = {
    deliveryType: DeliveryType | '';
    meetingProvider: string;
    locationIds: string[];
    details: WizardDetails;
};

export type ServiceDraftControls = {
    draft: ServiceDraft;
    setDeliveryType: (value: DeliveryType) => void;
    setMeetingProvider: (value: string) => void;
    setLocationIds: (value: string[]) => void;
    patchDetails: (patch: Partial<WizardDetails>) => void;
};

/**
 * Hold the service draft for a multi-screen creation flow.
 *
 * Picking "online" clears any chosen locations, since an online service is not
 * tied to a branch and those ids would otherwise be submitted alongside it.
 */
export function useServiceDraft(defaults: {
    categoryId?: number | null;
    specialistIds?: string[];
}): ServiceDraftControls {
    const { locale } = useLocale();

    const [draft, setDraft] = useState<ServiceDraft>({
        deliveryType: '',
        meetingProvider: '',
        locationIds: [],
        details: {
            title: '',
            categoryId: defaults.categoryId?.toString() ?? '',
            description: '',
            priceType: 'fixed',
            price: '',
            currency: defaultCurrencyForLocale(locale),
            priceMin: '',
            priceMax: '',
            duration: '',
            technicalBreak: '0',
            slotInterval: '',
            serviceType: 'individual',
            capacity: '',
            specialistIds: defaults.specialistIds ?? [],
            isActive: true,
        },
    });

    return {
        draft,
        setDeliveryType: (deliveryType) =>
            setDraft((current) => ({
                ...current,
                deliveryType,
                locationIds:
                    deliveryType === 'online' ? [] : current.locationIds,
            })),
        setMeetingProvider: (meetingProvider) =>
            setDraft((current) => ({ ...current, meetingProvider })),
        setLocationIds: (locationIds) =>
            setDraft((current) => ({ ...current, locationIds })),
        patchDetails: (patch) =>
            setDraft((current) => ({
                ...current,
                details: { ...current.details, ...patch },
            })),
    };
}

/**
 * The draft mirrored into hidden inputs so the surrounding `<Form>` submits it.
 *
 * Fields that do not apply to the current choices are left out entirely rather
 * than submitted empty, which is what the backend's `required_if` rules expect.
 */
export function ServiceFormInputs({ draft }: { draft: ServiceDraft }) {
    const { details } = draft;

    return (
        <>
            <input
                type="hidden"
                name="is_active"
                value={details.isActive ? '1' : '0'}
            />
            <input
                type="hidden"
                name="service_category_id"
                value={details.categoryId}
            />
            <input type="hidden" name="title" value={details.title} />
            <input
                type="hidden"
                name="description"
                value={details.description}
            />
            <input type="hidden" name="price_type" value={details.priceType} />
            {details.priceType === 'fixed' && (
                <input type="hidden" name="price" value={details.price} />
            )}
            {details.priceType === 'range' && (
                <>
                    <input
                        type="hidden"
                        name="price_min"
                        value={details.priceMin}
                    />
                    <input
                        type="hidden"
                        name="price_max"
                        value={details.priceMax}
                    />
                </>
            )}
            <input type="hidden" name="currency" value={details.currency} />
            <input type="hidden" name="duration" value={details.duration} />
            <input
                type="hidden"
                name="technical_break"
                value={details.technicalBreak}
            />
            {details.slotInterval !== '' && (
                <input
                    type="hidden"
                    name="slot_interval"
                    value={details.slotInterval}
                />
            )}
            <input
                type="hidden"
                name="service_type"
                value={details.serviceType}
            />
            {details.serviceType === 'group' && (
                <input type="hidden" name="capacity" value={details.capacity} />
            )}
            <input
                type="hidden"
                name="delivery_type"
                value={draft.deliveryType}
            />
            {draft.deliveryType === 'online' && (
                <input
                    type="hidden"
                    name="online_meeting_provider"
                    value={draft.meetingProvider}
                />
            )}
            {draft.locationIds.map((id) => (
                <input
                    key={`location-${id}`}
                    type="hidden"
                    name="location_ids[]"
                    value={id}
                />
            ))}
            {details.specialistIds.map((id) => (
                <input
                    key={`specialist-${id}`}
                    type="hidden"
                    name="user_ids[]"
                    value={id}
                />
            ))}
        </>
    );
}

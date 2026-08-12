import type { DeliveryType, PriceType, ServiceTypeValue } from '@/types';

type ServiceHiddenInputsProps = {
    isActive: boolean;
    categoryId: string;
    priceType: PriceType;
    serviceType: ServiceTypeValue;
    deliveryType: DeliveryType;
    meetingProvider: string;
    locationIds: string[];
    specialistIds: string[];
};

/**
 * Mirrors the drawer's controlled state into hidden inputs so the values ride
 * along with the native form submission. The selects and toggles above are all
 * client-controlled; these are what actually reach the server.
 */
export default function ServiceHiddenInputs({
    isActive,
    categoryId,
    priceType,
    serviceType,
    deliveryType,
    meetingProvider,
    locationIds,
    specialistIds,
}: ServiceHiddenInputsProps) {
    return (
        <>
            <input
                type="hidden"
                name="is_active"
                value={isActive ? '1' : '0'}
            />
            <input
                type="hidden"
                name="service_category_id"
                value={categoryId}
            />
            <input type="hidden" name="price_type" value={priceType} />
            <input type="hidden" name="service_type" value={serviceType} />
            <input type="hidden" name="delivery_type" value={deliveryType} />
            {deliveryType === 'online' && (
                <input
                    type="hidden"
                    name="online_meeting_provider"
                    value={meetingProvider}
                />
            )}
            {locationIds.map((id) => (
                <input
                    key={`location-${id}`}
                    type="hidden"
                    name="location_ids[]"
                    value={id}
                />
            ))}
            {specialistIds.map((id) => (
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

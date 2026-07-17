export type PriceType = 'free' | 'fixed' | 'range';
export type ServiceTypeValue = 'individual' | 'group';
export type DeliveryType = 'online' | 'onsite';

export type ServiceCategory = {
    id: number;
    name: string;
};

export type Service = {
    id: number;
    service_category_id: number | null;
    is_active: boolean;
    title: string;
    price_type: PriceType;
    price: string | null;
    price_min: string | null;
    price_max: string | null;
    duration: number;
    technical_break: number;
    service_type: ServiceTypeValue;
    delivery_type: DeliveryType;
    online_meeting_provider: string | null;
    capacity: number | null;
    description: string | null;
    location_ids: number[];
    user_ids: number[];
};

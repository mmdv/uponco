export type Location = {
    id: number;
    is_active: boolean;
    name: string;
    country: string;
    city: string;
    street_address: string;
    unit: string | null;
    postal_code: string;
    phone: string | null;
    place_id: string | null;
    formatted_address: string | null;
    latitude: number | null;
    longitude: number | null;
    is_geocoded: boolean;
    service_ids: number[];
    user_ids: number[];
};

export type SelectOption = {
    value: string;
    label: string;
};

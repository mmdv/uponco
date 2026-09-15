import { useState } from 'react';

import type { CustomerDetails } from '@/components/public-booking/step-details';
import { useTranslation } from '@/hooks/use-translation';
import { EMPTY_DETAILS, validateDetails } from '@/lib/booking';

export type BookingErrors = Partial<Record<string, string>>;

export type CustomerDetailsState = {
    details: CustomerDetails;
    errors: BookingErrors;
    setErrors: React.Dispatch<React.SetStateAction<BookingErrors>>;
    handleDetailChange: (field: keyof CustomerDetails, value: string) => void;
    /** Validate the current details, returning the field errors (empty when valid). */
    validate: () => BookingErrors;
    resetDetails: () => void;
};

/**
 * Owns the customer details form and its field errors. Validation messages are
 * translated here so the rest of the flow stays free of copy.
 */
export function useCustomerDetails(): CustomerDetailsState {
    const { t } = useTranslation('booking');
    const [details, setDetails] = useState<CustomerDetails>(EMPTY_DETAILS);
    const [errors, setErrors] = useState<BookingErrors>({});

    const detailMessages = {
        nameRequired: t('details.nameRequired'),
        contactRequired: t('details.contactRequired'),
        emailInvalid: t('details.emailInvalid'),
    };

    const handleDetailChange = (
        field: keyof CustomerDetails,
        value: string,
    ) => {
        setDetails((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            const next = { ...current };
            delete next[field];

            // Editing either contact field clears the "already booked this
            // session" conflict so the banner disappears as the user corrects it.
            if (field === 'customer_email' || field === 'customer_phone') {
                delete next.booking_conflict;
            }

            return next;
        });
    };

    const resetDetails = () => {
        setDetails(EMPTY_DETAILS);
        setErrors({});
    };

    return {
        details,
        errors,
        setErrors,
        handleDetailChange,
        validate: () => validateDetails(details, detailMessages),
        resetDetails,
    };
}

import type { LucideIcon } from 'lucide-react';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import type { PublicBookingProps } from '@/components/public-booking/booking-flow';
import { useAppointmentBooking } from '@/hooks/use-appointment-booking';
import { businessCategoryIcon } from '@/lib/business-category-icons';

type Booking = ReturnType<typeof useAppointmentBooking>;

type BookingContextValue = Booking & {
    company: PublicBookingProps['company'];
    timezone: string;
    preset: PublicBookingProps['preset'];
    /** The business category's icon, so a vet clinic isn't fronted by scissors. */
    serviceIcon: LucideIcon;
};

const BookingContext = createContext<BookingContextValue | null>(null);

/** The booking flow's shared state. Throws when used outside a `BookingProvider`. */
export function useBooking(): BookingContextValue {
    const context = useContext(BookingContext);

    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider.');
    }

    return context;
}

type BookingProviderProps = PublicBookingProps & {
    children: ReactNode;
};

/**
 * Runs the booking flow and shares it with the step components, so the flow and
 * its children read state straight from context instead of drilling ~30 props.
 */
export function BookingProvider({
    company,
    timezone,
    services,
    locations,
    specialists,
    preset = null,
    slotWindow,
    children,
}: BookingProviderProps) {
    const booking = useAppointmentBooking({
        company,
        timezone,
        services,
        locations,
        specialists,
        slotWindow,
        preset,
    });

    const value: BookingContextValue = {
        ...booking,
        company,
        timezone,
        preset,
        serviceIcon: businessCategoryIcon(company.category),
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
}

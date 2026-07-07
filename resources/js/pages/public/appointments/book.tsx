import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import BookingFooter from '@/components/public-booking/booking-footer';
import BookingHeader from '@/components/public-booking/booking-header';
import type { PublicTheme } from '@/components/public-booking/booking-header';
import StepDateTime from '@/components/public-booking/step-datetime';
import StepDetails from '@/components/public-booking/step-details';
import StepSelection from '@/components/public-booking/step-selection';
import SuccessScreen from '@/components/public-booking/success-screen';
import SummaryBar from '@/components/public-booking/summary-bar';
import { useAppointmentBooking } from '@/hooks/use-appointment-booking';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

type Props = {
    company: { name: string; slug: string; logo?: string | null };
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    availableSlots?: AppointmentSlot[];
};

const STEP_TITLES = [
    'What would you like to book?',
    'Pick a date & time',
    'Almost done',
];

// The public page keeps its own light/dark preference, separate from the
// dashboard's appearance so a visitor's choice never affects the team's user.
const THEME_STORAGE_KEY = 'public-booking-appearance';

function readStoredTheme(): PublicTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'dark' || stored === 'light') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

export default function PublicAppointmentBooking({
    company,
    timezone,
    services,
    locations,
    specialists,
    availableSlots = [],
}: Props) {
    const booking = useAppointmentBooking({
        company,
        timezone,
        services,
        locations,
        specialists,
        availableSlots,
    });

    const { step, confirmed } = booking;

    const [theme, setTheme] = useState<PublicTheme>(readStoredTheme);

    // Apply and persist the visitor's chosen theme for the public page.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    return (
        <div className="flex min-h-svh w-full justify-center bg-muted/30">
            <Head title={`Book an appointment · ${company.name}`} />

            <div className="flex w-full max-w-[460px] flex-col">
                <header className="space-y-4 px-5 pt-4 pb-3">
                    <BookingHeader
                        companyName={company.name}
                        logoUrl={company.logo}
                        theme={theme}
                        onThemeChange={setTheme}
                    />

                    {confirmed === null && <SummaryBar {...booking.summary} />}
                </header>

                <main className="flex-1 px-5 pb-28">
                    {confirmed !== null ? (
                        <SuccessScreen
                            companyName={company.name}
                            customerName={confirmed.customerName}
                            summary={confirmed}
                            calendar={confirmed.calendar}
                            onBookAnother={booking.resetFlow}
                        />
                    ) : (
                        <div key={step} className={booking.stepClass}>
                            <h2 className="mb-4 text-base font-semibold">
                                {STEP_TITLES[step]}
                            </h2>

                            {step === 0 && (
                                <StepSelection
                                    openCard={booking.openCard}
                                    onToggle={booking.toggleCard}
                                    serviceGroups={booking.serviceGroups}
                                    locations={booking.availableLocations}
                                    specialists={booking.availableSpecialists}
                                    serviceId={booking.serviceId}
                                    locationId={booking.locationId}
                                    specialistId={booking.specialistId}
                                    selectedService={booking.selectedService}
                                    selectedLocation={booking.selectedLocation}
                                    selectedSpecialist={
                                        booking.selectedSpecialist
                                    }
                                    onServiceChange={
                                        booking.handleServiceChange
                                    }
                                    onLocationChange={
                                        booking.handleLocationChange
                                    }
                                    onSpecialistChange={
                                        booking.handleSpecialistChange
                                    }
                                />
                            )}

                            {step === 1 && (
                                <StepDateTime
                                    days={booking.upcomingDays}
                                    date={booking.date}
                                    onDateChange={booking.handleDateChange}
                                    timezone={timezone}
                                    slots={booking.availableSlots}
                                    loading={booking.slotsLoading}
                                    selectedStart={booking.selectedStart}
                                    onSelectSlot={booking.handleSelectSlot}
                                    error={booking.errors.start_at}
                                />
                            )}

                            {step === 2 && (
                                <StepDetails
                                    values={booking.details}
                                    onChange={booking.handleDetailChange}
                                    errors={booking.errors}
                                />
                            )}
                        </div>
                    )}
                </main>

                {confirmed === null && (
                    <BookingFooter
                        step={step}
                        canContinue={
                            step === 0
                                ? booking.selectionComplete
                                : booking.selectedStart !== ''
                        }
                        processing={booking.processing}
                        onBack={() => booking.goToStep(step - 1)}
                        onContinue={booking.handleContinue}
                        onSubmit={booking.handleSubmit}
                    />
                )}
            </div>
        </div>
    );
}

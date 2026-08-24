import BookingFooter from '@/components/public-booking/booking-footer';
import type { PublicTheme } from '@/components/public-booking/booking-header';
import BookingHeader from '@/components/public-booking/booking-header';
import StepDateTime from '@/components/public-booking/step-datetime';
import StepDetails from '@/components/public-booking/step-details';
import StepSelection from '@/components/public-booking/step-selection';
import SuccessScreen from '@/components/public-booking/success-screen';
import SummaryBar from '@/components/public-booking/summary-bar';
import { useAppointmentBooking } from '@/hooks/use-appointment-booking';
import { useTranslation } from '@/hooks/use-translation';
import type { BookingPreset } from '@/lib/booking';
import type { BrandPalette } from '@/lib/brand';
import { businessCategoryIcon } from '@/lib/business-category-icons';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSlot,
    AppointmentSpecialistOption,
} from '@/types';

export type PublicBookingProps = {
    company: {
        name: string;
        slug: string;
        logo?: string | null;
        /** The team's business category, from `App\Enums\BusinessCategory`. */
        category?: string | null;
        /** `individual` or `organisation`, from `App\Enums\TeamType`. */
        type?: string | null;
        /** The name the page leads with — the person's, for a solo business. */
        headline: string;
        /** Their job title, or null to fall back to "Book an appointment". */
        tagline?: string | null;
        /** The team's brand colours; absent falls back to the platform blue. */
        brand?: BrandPalette | null;
    };
    timezone: string;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationDetail[];
    specialists: AppointmentSpecialistOption[];
    /** Set when the visitor arrived through a deep-linked booking URL. */
    preset?: BookingPreset | null;
    /** Slots for a window of days keyed by `YYYY-MM-DD`, when the page shipped one. */
    slotWindow?: Record<string, AppointmentSlot[]>;
};

type FlowProps = PublicBookingProps & {
    theme?: PublicTheme;
    onThemeChange?: (theme: PublicTheme) => void;
    /**
     * Renders the flow inside its host container rather than as a full page:
     * no share/appearance menu and a footer pinned to the container.
     */
    embedded?: boolean;
};

/**
 * The public booking wizard itself, without any page-level chrome, so the
 * dashboard can embed the very same flow admins hand to their customers.
 *
 * This lives outside the Inertia page directory on purpose. Importing a page
 * module from a non-page module demotes it from a Vite entry point to an
 * anonymous chunk, which drops it out of the manifest and 500s the page.
 */
export function PublicBookingFlow({
    company,
    timezone,
    services,
    locations,
    specialists,
    preset = null,
    slotWindow,
    theme = 'light',
    onThemeChange = () => {},
    embedded = false,
}: FlowProps) {
    const { t } = useTranslation('booking');
    const stepTitles = [
        t('steps.selection'),
        t('steps.datetime'),
        t('steps.details'),
    ];

    const booking = useAppointmentBooking({
        company,
        timezone,
        services,
        locations,
        specialists,
        slotWindow,
        preset,
    });

    const { step, confirmed, selectionIsFixed } = booking;

    // What the business does decides how a service is pictured, everywhere the
    // chosen service is shown back to the customer.
    const serviceIcon = businessCategoryIcon(company.category);

    return (
        <>
            <header className="space-y-4 px-5 pt-4 pb-3">
                <BookingHeader
                    companyName={company.name}
                    headline={company.headline}
                    tagline={company.tagline}
                    logoUrl={company.logo}
                    backUrl={preset?.back_url}
                    theme={theme}
                    onThemeChange={onThemeChange}
                    showMenu={!embedded}
                />

                {/*
                 * Step one already shows every choice in full, so a summary
                 * above it would only repeat the cards underneath. It earns
                 * its place from step two on, once those cards are behind you.
                 */}
                {confirmed === null && step > 0 && (
                    <SummaryBar
                        {...booking.summary}
                        serviceIcon={serviceIcon}
                    />
                )}
            </header>

            <main
                className={embedded ? 'flex-1 px-5 pb-5' : 'flex-1 px-5 pb-28'}
            >
                {confirmed !== null ? (
                    <SuccessScreen
                        companyName={company.name}
                        customerName={confirmed.customerName}
                        summary={confirmed}
                        calendar={confirmed.calendar}
                        serviceIcon={serviceIcon}
                        onBookAnother={booking.resetFlow}
                    />
                ) : (
                    <div key={step} className={booking.stepClass}>
                        <h2 className="mb-4 text-base font-semibold">
                            {step === 0 && selectionIsFixed
                                ? t('steps.recap')
                                : stepTitles[step]}
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
                                locationVisible={booking.locationVisible}
                                selectedService={booking.selectedService}
                                selectedLocation={booking.selectedLocation}
                                selectedSpecialist={booking.selectedSpecialist}
                                locked={booking.locked}
                                order={booking.order}
                                onServiceChange={booking.handleServiceChange}
                                onLocationChange={booking.handleLocationChange}
                                onSpecialistChange={
                                    booking.handleSpecialistChange
                                }
                                serviceIcon={serviceIcon}
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
                    continueLabel={
                        step === 0 && selectionIsFixed
                            ? t('footer.chooseDateTime')
                            : t('footer.continue')
                    }
                    processing={booking.processing}
                    onBack={() => booking.goToStep(step - 1)}
                    onContinue={booking.handleContinue}
                    onSubmit={booking.handleSubmit}
                    embedded={embedded}
                />
            )}
        </>
    );
}

import {
    BookingProvider,
    useBooking,
} from '@/components/public-booking/booking-context';
import BookingFooter from '@/components/public-booking/booking-footer';
import type { PublicTheme } from '@/components/public-booking/booking-header';
import BookingHeader from '@/components/public-booking/booking-header';
import StepDateTime from '@/components/public-booking/step-datetime';
import StepDetails from '@/components/public-booking/step-details';
import StepSelection from '@/components/public-booking/step-selection';
import SuccessScreen from '@/components/public-booking/success-screen';
import SummaryBar from '@/components/public-booking/summary-bar';
import { useTranslation } from '@/hooks/use-translation';
import type { BookingPreset } from '@/lib/booking';
import type { BrandPalette } from '@/lib/brand';
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

type ChromeProps = {
    theme: PublicTheme;
    onThemeChange: (theme: PublicTheme) => void;
    embedded: boolean;
};

/**
 * The wizard body. Reads every booking value from context (see
 * {@link BookingProvider}); only the page chrome — theme and embedding — comes
 * in as props, since it is not part of the booking state.
 */
function BookingFlowLayout({ theme, onThemeChange, embedded }: ChromeProps) {
    const { t } = useTranslation('booking');
    const {
        company,
        timezone,
        preset,
        serviceIcon,
        step,
        stepClass,
        confirmed,
        selectionIsFixed,
        selectionComplete,
        selectedStart,
        processing,
        summary,
        goToStep,
        handleContinue,
        handleSubmit,
        resetFlow,
    } = useBooking();

    const stepTitles = [
        t('steps.selection'),
        t('steps.datetime'),
        t('steps.details'),
    ];

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
                    <SummaryBar {...summary} serviceIcon={serviceIcon} />
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
                        onBookAnother={resetFlow}
                    />
                ) : (
                    <div key={step} className={stepClass}>
                        <h2 className="mb-4 text-base font-semibold">
                            {step === 0 && selectionIsFixed
                                ? t('steps.recap')
                                : stepTitles[step]}
                        </h2>

                        {step === 0 && <StepSelection />}
                        {step === 1 && <StepDateTime timezone={timezone} />}
                        {step === 2 && <StepDetails />}
                    </div>
                )}
            </main>

            {confirmed === null && (
                <BookingFooter
                    step={step}
                    canContinue={
                        step === 0 ? selectionComplete : selectedStart !== ''
                    }
                    continueLabel={
                        step === 0 && selectionIsFixed
                            ? t('footer.chooseDateTime')
                            : t('footer.continue')
                    }
                    processing={processing}
                    onBack={() => goToStep(step - 1)}
                    onContinue={handleContinue}
                    onSubmit={handleSubmit}
                    embedded={embedded}
                />
            )}
        </>
    );
}

/**
 * The public booking wizard, without any page-level chrome, so the dashboard
 * can embed the very same flow admins hand to their customers.
 *
 * This lives outside the Inertia page directory on purpose. Importing a page
 * module from a non-page module demotes it from a Vite entry point to an
 * anonymous chunk, which drops it out of the manifest and 500s the page.
 */
export function PublicBookingFlow({
    theme = 'light',
    onThemeChange = () => {},
    embedded = false,
    ...serverProps
}: FlowProps) {
    return (
        <BookingProvider {...serverProps}>
            <BookingFlowLayout
                theme={theme}
                onThemeChange={onThemeChange}
                embedded={embedded}
            />
        </BookingProvider>
    );
}

import { Form } from '@inertiajs/react';
import { useState } from 'react';

import StepDelivery from '@/components/services/service-wizard/step-delivery';
import StepDetails from '@/components/services/service-wizard/step-details';
import type { WizardDetails } from '@/components/services/service-wizard/step-details';
import StepLocations from '@/components/services/service-wizard/step-locations';
import StepOnlineMethod from '@/components/services/service-wizard/step-online-method';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { defaultCurrencyForLocale } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { store } from '@/routes/company/services';
import type {
    DeliveryType,
    GoogleIntegrationStatus,
    SelectOption,
    ServiceCategory,
} from '@/types';

type StepId = 'delivery' | 'online-method' | 'locations' | 'details';

export type ServiceWizardFieldsProps = {
    defaultCategoryId: number | null;
    teamSlug: string;
    categories: ServiceCategory[];
    locations: SelectOption[];
    serviceOptions: SelectOption[];
    specialists: SelectOption[];
    countries: SelectOption[];
    priceTypes: SelectOption[];
    currencies: SelectOption[];
    serviceTypes: SelectOption[];
    google: GoogleIntegrationStatus;
};

/** Which wizard step a server-side validation error belongs to. */
function stepForField(field: string): StepId {
    if (field === 'delivery_type') {
        return 'delivery';
    }

    if (field === 'online_meeting_provider') {
        return 'online-method';
    }

    if (field.startsWith('location_ids')) {
        return 'locations';
    }

    return 'details';
}

/**
 * The service creation wizard without any surrounding chrome, so it can be
 * rendered inside a dialog or straight onto a page (onboarding).
 *
 * `inline` drops the dialog's scroll container and borders, leaving the page to
 * own the scrolling.
 */
export default function ServiceWizardFields({
    defaultCategoryId,
    teamSlug,
    categories,
    locations,
    serviceOptions,
    specialists,
    countries,
    priceTypes,
    currencies,
    serviceTypes,
    google,
    inline = false,
    onSuccess,
    onCancel,
    footer,
}: ServiceWizardFieldsProps & {
    inline?: boolean;
    onSuccess: () => void;
    /** When omitted, the first step renders no cancel button. */
    onCancel?: () => void;
    /** Extra content rendered alongside the wizard's own footer buttons. */
    footer?: React.ReactNode;
}) {
    const { t } = useTranslation('company');
    const { locale } = useLocale();

    const [step, setStep] = useState<StepId>('delivery');
    // Nothing is validated until the user asks to create the service, so the
    // details step opens clean instead of flagging fields nobody has filled in.
    const [submitted, setSubmitted] = useState(false);
    const [deliveryType, setDeliveryType] = useState<DeliveryType | ''>('');
    const [meetingProvider, setMeetingProvider] = useState('');
    const [locationIds, setLocationIds] = useState<string[]>([]);
    const [details, setDetails] = useState<WizardDetails>({
        title: '',
        categoryId: defaultCategoryId?.toString() ?? '',
        description: '',
        priceType: 'fixed',
        price: '',
        currency: defaultCurrencyForLocale(locale),
        priceMin: '',
        priceMax: '',
        duration: '',
        technicalBreak: '0',
        serviceType: 'individual',
        capacity: '',
        specialistIds: [],
        isActive: true,
    });

    const patchDetails = (patch: Partial<WizardDetails>) =>
        setDetails((current) => ({ ...current, ...patch }));

    // The middle step depends on the delivery branch; before a delivery type
    // is picked the online branch is shown as a placeholder in the indicator.
    const middleStep: StepId =
        deliveryType === 'onsite' ? 'locations' : 'online-method';
    const steps: StepId[] = ['delivery', middleStep, 'details'];
    const stepIndex = steps.indexOf(step);

    const stepLabels: Record<StepId, string> = {
        delivery: t('services.wizard.steps.delivery'),
        'online-method': deliveryType
            ? t('services.wizard.steps.onlineMethod')
            : t('services.wizard.steps.setup'),
        locations: t('services.wizard.steps.locations'),
        details: t('services.wizard.steps.details'),
    };

    const canProceed =
        step === 'delivery'
            ? deliveryType !== ''
            : step === 'online-method'
              ? meetingProvider !== ''
              : step === 'locations'
                ? locationIds.length > 0
                : true;

    const selectDeliveryType = (next: DeliveryType) => {
        setDeliveryType(next);

        // Online services are not tied to a branch.
        if (next === 'online') {
            setLocationIds([]);
        }
    };

    const summary =
        deliveryType === 'onsite'
            ? `${t('services.wizard.summary.onsite')} · ${t(
                  'services.wizard.summary.locations',
                  { count: locationIds.length },
              )}`
            : `${t('services.wizard.summary.online')} · ${
                  meetingProvider === 'google_meet'
                      ? t('services.wizard.summary.automatic')
                      : t('services.wizard.summary.manual')
              }`;

    // A category is optional, so leaving it unset is an explicit choice rather
    // than an empty field. The blank value submits as null.
    const categoryOptions: SelectOption[] = [
        { value: '', label: t('services.form.categoryNone') },
        ...categories.map((category) => ({
            value: category.id.toString(),
            label: category.name,
        })),
    ];

    return (
        <Form
            {...store.form(teamSlug)}
            options={{ preserveScroll: true }}
            onBefore={() => setSubmitted(true)}
            onSuccess={onSuccess}
            onError={(errors) => {
                // Send the user to the earliest step that has a problem.
                const erroredStep = steps.find((candidate) =>
                    Object.keys(errors).some(
                        (field) => stepForField(field) === candidate,
                    ),
                );

                if (erroredStep) {
                    setStep(erroredStep);
                }
            }}
            className={cn('flex flex-col', inline ? 'gap-6' : 'min-h-0 flex-1')}
            disableWhileProcessing
        >
            {({ errors, processing }) => (
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
                    <input
                        type="hidden"
                        name="price_type"
                        value={details.priceType}
                    />
                    {details.priceType === 'fixed' && (
                        <input
                            type="hidden"
                            name="price"
                            value={details.price}
                        />
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
                    <input
                        type="hidden"
                        name="currency"
                        value={details.currency}
                    />
                    <input
                        type="hidden"
                        name="duration"
                        value={details.duration}
                    />
                    <input
                        type="hidden"
                        name="technical_break"
                        value={details.technicalBreak}
                    />
                    <input
                        type="hidden"
                        name="service_type"
                        value={details.serviceType}
                    />
                    {details.serviceType === 'group' && (
                        <input
                            type="hidden"
                            name="capacity"
                            value={details.capacity}
                        />
                    )}
                    <input
                        type="hidden"
                        name="delivery_type"
                        value={deliveryType}
                    />
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
                    {details.specialistIds.map((id) => (
                        <input
                            key={`specialist-${id}`}
                            type="hidden"
                            name="user_ids[]"
                            value={id}
                        />
                    ))}

                    {/* Tabs sit on the panel's top border and the active one
                        opens into it: its bottom border is transparent, and the
                        tab's own background (painted under the border box)
                        masks the panel border running beneath. */}
                    <div
                        className={cn(
                            'flex flex-col',
                            !inline && 'min-h-0 flex-1 px-4 pt-3 pb-4',
                        )}
                    >
                        <ol
                            aria-label={t('services.wizard.stepLabel', {
                                current: stepIndex + 1,
                                total: steps.length,
                            })}
                            className="-mb-px flex shrink-0 items-end gap-1"
                        >
                            {steps.map((candidate, index) => {
                                const isCurrent = candidate === step;

                                return (
                                    <li
                                        key={candidate}
                                        aria-current={
                                            isCurrent ? 'step' : undefined
                                        }
                                        className={cn(
                                            'flex flex-1 items-center gap-2 rounded-t-lg border px-3 py-2',
                                            isCurrent
                                                ? cn(
                                                      // The panel is a later
                                                      // sibling, so it paints
                                                      // over this tab's bottom
                                                      // edge unless the tab is
                                                      // lifted above it.
                                                      'relative z-10 border-b-transparent',
                                                      inline
                                                          ? 'bg-card'
                                                          : 'bg-background',
                                                  )
                                                : 'bg-muted/40',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                                                index <= stepIndex
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {index + 1}
                                        </span>
                                        <span
                                            className={cn(
                                                'truncate text-xs',
                                                isCurrent
                                                    ? 'font-medium'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {stepLabels[candidate]}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>

                        <div
                            className={cn(
                                'rounded-b-lg border p-4',
                                !inline && 'min-h-0 flex-1 overflow-y-auto',
                            )}
                        >
                            {step === 'delivery' && (
                                <StepDelivery
                                    value={deliveryType}
                                    onChange={selectDeliveryType}
                                />
                            )}
                            {step === 'online-method' && (
                                <StepOnlineMethod
                                    value={meetingProvider}
                                    onChange={setMeetingProvider}
                                    google={google}
                                />
                            )}
                            {step === 'locations' && (
                                <StepLocations
                                    teamSlug={teamSlug}
                                    locations={locations}
                                    services={serviceOptions}
                                    specialists={specialists}
                                    countries={countries}
                                    value={locationIds}
                                    onChange={setLocationIds}
                                />
                            )}
                            {step === 'details' && (
                                <StepDetails
                                    details={details}
                                    onPatch={patchDetails}
                                    summary={summary}
                                    onEditDelivery={() => setStep('delivery')}
                                    categoryOptions={categoryOptions}
                                    teamSlug={teamSlug}
                                    specialists={specialists}
                                    priceTypes={priceTypes}
                                    currencies={currencies}
                                    serviceTypes={serviceTypes}
                                    errors={submitted ? errors : {}}
                                />
                            )}
                        </div>
                    </div>

                    <div
                        className={cn(
                            'flex shrink-0 flex-row items-center gap-2 border-t',
                            inline ? 'pt-5' : 'p-4',
                        )}
                    >
                        <span className="mr-auto text-xs text-muted-foreground">
                            {t('services.wizard.stepLabel', {
                                current: stepIndex + 1,
                                total: steps.length,
                            })}
                        </span>
                        {footer}
                        {stepIndex === 0 ? (
                            onCancel ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onCancel}
                                >
                                    {t('services.wizard.cancel')}
                                </Button>
                            ) : null
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    setStep(steps[Math.max(stepIndex - 1, 0)])
                                }
                                data-test="wizard-back-button"
                            >
                                {t('services.wizard.back')}
                            </Button>
                        )}
                        {/* Distinct keys keep React from reusing one <button>
                            for both: reusing it turns the click that reveals
                            the details step into a submit, because the node is
                            already `type="submit"` by the time the browser acts
                            on the click. */}
                        {step === 'details' ? (
                            <Button
                                key="submit"
                                type="submit"
                                disabled={processing}
                                data-test="wizard-create-button"
                            >
                                {t('services.wizard.create')}
                            </Button>
                        ) : (
                            <Button
                                key="next"
                                type="button"
                                disabled={!canProceed}
                                onClick={() =>
                                    setStep(
                                        steps[
                                            Math.min(
                                                stepIndex + 1,
                                                steps.length - 1,
                                            )
                                        ],
                                    )
                                }
                                data-test="wizard-next-button"
                            >
                                {t('services.wizard.next')}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Form>
    );
}

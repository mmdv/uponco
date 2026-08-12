import InputError from '@/components/input-error';
import NumericInput from '@/components/numeric-input';
import { OptionToggleGroup } from '@/components/services/option-toggle-group';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTranslation } from '@/hooks/use-translation';
import type {
    DeliveryType,
    SelectOption,
    Service,
    ServiceTypeValue,
} from '@/types';

type ServiceTypeFieldsProps = {
    serviceTypes: SelectOption[];
    serviceType: ServiceTypeValue;
    onServiceTypeChange: (value: ServiceTypeValue) => void;
    deliveryTypes: SelectOption[];
    deliveryType: DeliveryType;
    onDeliveryTypeChange: (value: DeliveryType) => void;
    meetingProviders: SelectOption[];
    meetingProvider: string;
    onMeetingProviderChange: (value: string) => void;
    service: Service | null;
    errors: Record<string, string>;
};

/**
 * The "what kind of service" fields: individual vs. group (with a capacity when
 * grouped), and onsite vs. online delivery (with a meeting provider when
 * online). The delivery toggle's side effects live in the parent.
 */
export default function ServiceTypeFields({
    serviceTypes,
    serviceType,
    onServiceTypeChange,
    deliveryTypes,
    deliveryType,
    onDeliveryTypeChange,
    meetingProviders,
    meetingProvider,
    onMeetingProviderChange,
    service,
    errors,
}: ServiceTypeFieldsProps) {
    const { t } = useTranslation('company');

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="service_type">
                    {t('services.form.serviceType')}
                </Label>
                <OptionToggleGroup
                    id="service_type"
                    options={serviceTypes}
                    value={serviceType}
                    onChange={(value) =>
                        onServiceTypeChange(value as ServiceTypeValue)
                    }
                    invalid={Boolean(errors.service_type)}
                    data-test="service-type-select"
                />
                <InputError message={errors.service_type} />
            </div>

            {serviceType === 'group' && (
                <div className="grid gap-2">
                    <Label htmlFor="capacity">
                        {t('services.form.capacity')}
                    </Label>
                    <NumericInput
                        id="capacity"
                        name="capacity"
                        defaultValue={service?.capacity ?? ''}
                        placeholder="10"
                    />
                    <InputError message={errors.capacity} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="delivery_type">
                    {t('services.form.deliveryType')}
                </Label>
                <OptionToggleGroup
                    id="delivery_type"
                    options={deliveryTypes}
                    value={deliveryType}
                    onChange={(value) =>
                        onDeliveryTypeChange(value as DeliveryType)
                    }
                    invalid={Boolean(errors.delivery_type)}
                    data-test="service-delivery-type-select"
                />
                <InputError message={errors.delivery_type} />
            </div>

            {deliveryType === 'online' && (
                <div className="grid gap-2">
                    <Label htmlFor="online_meeting_provider">
                        {t('services.form.onlineMeetingProvider')}
                    </Label>
                    <SearchableSelect
                        id="online_meeting_provider"
                        options={meetingProviders}
                        value={meetingProvider}
                        onChange={onMeetingProviderChange}
                        placeholder={t(
                            'services.form.onlineMeetingProviderPlaceholder',
                        )}
                        invalid={Boolean(errors.online_meeting_provider)}
                        data-test="service-meeting-provider-select"
                    />
                    <InputError message={errors.online_meeting_provider} />
                </div>
            )}
        </>
    );
}

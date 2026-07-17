import { MapPin, Video } from 'lucide-react';

import ChoiceCard from '@/components/services/service-wizard/choice-card';
import { useTranslation } from '@/hooks/use-translation';
import type { DeliveryType } from '@/types';

/**
 * First wizard step: how is the service delivered? The choice decides which
 * branch step follows (locations for onsite, meeting setup for online).
 */
export default function StepDelivery({
    value,
    onChange,
}: {
    value: DeliveryType | '';
    onChange: (value: DeliveryType) => void;
}) {
    const { t } = useTranslation('company');

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium">
                    {t('services.wizard.delivery.heading')}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t('services.wizard.delivery.subheading')}
                </p>
            </div>

            <div
                role="radiogroup"
                aria-label={t('services.wizard.delivery.heading')}
                className="space-y-3"
            >
                <ChoiceCard
                    icon={MapPin}
                    title={t('services.wizard.delivery.onsiteTitle')}
                    description={t(
                        'services.wizard.delivery.onsiteDescription',
                    )}
                    selected={value === 'onsite'}
                    onSelect={() => onChange('onsite')}
                    data-test="wizard-delivery-onsite"
                />
                <ChoiceCard
                    icon={Video}
                    title={t('services.wizard.delivery.onlineTitle')}
                    description={t(
                        'services.wizard.delivery.onlineDescription',
                    )}
                    selected={value === 'online'}
                    onSelect={() => onChange('online')}
                    data-test="wizard-delivery-online"
                />
            </div>
        </div>
    );
}

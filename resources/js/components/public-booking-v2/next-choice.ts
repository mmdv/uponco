import { useBooking } from '@/components/public-booking-v2/booking-context';
import { useTranslation } from '@/hooks/use-translation';
import type { SelectionKind } from '@/lib/booking';

/**
 * The first choice the booking still needs, in the order the hub shows them,
 * with the button label that asks for it ("Choose a specialist"). A location
 * only counts as missing once the chosen service actually requires one.
 */
export function useNextChoice(): {
    missing: SelectionKind | null;
    label: string | null;
} {
    const { t } = useTranslation('booking');
    const { order, serviceId, specialistId, locationId, requiresLocation } =
        useBooking();

    const chosen: Record<SelectionKind, boolean> = {
        service: serviceId !== null,
        specialist: specialistId !== null,
        location: !requiresLocation || locationId !== null,
    };
    const labels: Record<SelectionKind, string> = {
        service: t('v2.footer.chooseService'),
        specialist: t('v2.footer.chooseSpecialist'),
        location: t('v2.footer.chooseLocation'),
    };
    const missing = order.find((kind) => !chosen[kind]) ?? null;

    return { missing, label: missing ? labels[missing] : null };
}

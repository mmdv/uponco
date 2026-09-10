import { usePage } from '@inertiajs/react';

import { useTranslation } from '@/hooks/use-translation';
import { customerTermKey } from '@/lib/business-category-terms';

/**
 * The noun for the people a team serves, adapted to its business category — a
 * clinic sees "Patient", a salon "Client", a tutor "Student", everyone else
 * "Customer". Used wherever the appointment UI labels the booking's customer.
 */
export function useCustomerTerm(): string {
    const { t } = useTranslation('appointments');
    const { currentTeam } = usePage().props;

    return t(`customerTerm.${customerTermKey(currentTeam?.businessCategory)}`);
}

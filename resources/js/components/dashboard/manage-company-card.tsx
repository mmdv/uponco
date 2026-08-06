import { Link } from '@inertiajs/react';
import { Building2, ChevronRight, MapPin, Palette, Wrench } from 'lucide-react';

import { ACCENTS } from '@/components/accents';
import { CompanyGraphic } from '@/components/card-graphics';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';

/** The company hub keeps the brand blue, matching the company page itself. */
const STYLES = ACCENTS.deep;

/** The facets of the company hub, surfaced so the destination is obvious. */
const FACETS = [
    { icon: Wrench, key: 'services' },
    { icon: MapPin, key: 'locations' },
    { icon: Building2, key: 'team' },
    { icon: Palette, key: 'brand' },
] as const;

/**
 * Points at the company hub, where the details behind the booking page —
 * services, locations, people and branding — are managed.
 */
export default function ManageCompanyCard() {
    const { t } = useTranslation('dashboard');

    return (
        <Link
            href={companyIndex.url()}
            data-test="dashboard-manage-company"
            className={cn(
                'group relative flex max-w-full flex-col gap-4 overflow-hidden rounded-2xl border border-black/[0.08] bg-card p-5 text-card-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6 dark:border-border',
                STYLES.ring,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
                    STYLES.wash,
                )}
            />
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 group-hover:opacity-80',
                    STYLES.graphic,
                )}
            >
                <CompanyGraphic />
            </div>

            <div className="relative flex items-start gap-3">
                <span
                    className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105',
                        STYLES.gradient,
                        STYLES.shadow,
                    )}
                >
                    <Building2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="truncate text-base font-semibold">
                        {t('manageCompany.title')}
                    </h3>
                    <p className="text-sm font-medium text-foreground/75">
                        {t('manageCompany.subtitle')}
                    </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/80" />
            </div>

            <div className="relative flex flex-wrap gap-2">
                {FACETS.map(({ icon: Icon, key }) => (
                    <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-card/70 px-2.5 py-1 text-xs font-semibold text-foreground/75 dark:border-border dark:bg-card/50"
                    >
                        <Icon className="size-3.5" />
                        {t(`manageCompany.facets.${key}`)}
                    </span>
                ))}
            </div>
        </Link>
    );
}

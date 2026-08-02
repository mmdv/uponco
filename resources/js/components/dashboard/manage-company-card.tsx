import { Link } from '@inertiajs/react';
import { Building2, ChevronRight, MapPin, Palette, Wrench } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { index as companyIndex } from '@/routes/company';

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
            className="group flex max-w-full flex-col gap-4 rounded-2xl border border-[#f1f3f5] bg-card p-5 text-card-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 sm:p-6 dark:border-border"
        >
            <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Building2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="truncate text-base font-medium">
                        {t('manageCompany.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('manageCompany.subtitle')}
                    </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>

            <div className="flex flex-wrap gap-2">
                {FACETS.map(({ icon: Icon, key }) => (
                    <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                        <Icon className="size-3.5" />
                        {t(`manageCompany.facets.${key}`)}
                    </span>
                ))}
            </div>
        </Link>
    );
}

import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    CalendarClock,
    ChevronRight,
    MapPin,
    Palette,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { ACCENTS } from '@/components/accents';
import type { AccentStyles } from '@/components/accents';
import {
    BrandGraphic,
    BusinessGraphic,
    LocationsGraphic,
    ScheduleGraphic,
    ServicesGraphic,
} from '@/components/card-graphics';
import Heading from '@/components/heading';
import ScheduleAvailabilityChart from '@/components/schedule/schedule-availability-chart';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';
import { edit as editBusiness } from '@/routes/company/business';
import { index as locationsIndex } from '@/routes/company/locations';
import { index as servicesIndex } from '@/routes/company/services';
import { index as scheduleIndex } from '@/routes/schedule';
import type { ScheduleSummary } from '@/types';

type Props = {
    team: { name: string };
    business: {
        total: number;
        roles: { role: string; label: string; count: number }[];
        people: { name: string; role: string }[];
    };
    schedule: ScheduleSummary;
    locations: {
        count: number;
        cities: string[];
    };
    services: {
        count: number;
        categories: number;
        items: {
            title: string;
            duration: number;
            price: string | null;
            category: string | null;
        }[];
    };
};

/** Brand-primary gradient used for the team avatars and brand swatches. */
const PRIMARY_GRADIENT = 'from-[#0063ff] to-[#3884fe]';

/**
 * Per-card personality, drawn from the shared palette. Every tile keeps the
 * same shell — radius, border, lift-on-hover — but carries its own hue, icon
 * tile and background graphic so the grid reads as five distinct places to
 * manage rather than five clones. The hues match their counterparts on the
 * dashboard, so a card means the same thing wherever you meet it.
 */
const CARD_ACCENTS = {
    business: ACCENTS.brand,
    services: ACCENTS.deep,
    schedule: ACCENTS.bright,
    locations: ACCENTS.ink,
    brand: ACCENTS.soft,
};

function formatPrice(price: string | null): string | null {
    if (price === null) {
        return null;
    }

    const value = Number(price);

    return Number.isNaN(value)
        ? price
        : `$${value % 1 === 0 ? value : value.toFixed(2)}`;
}

export default function CompanyIndex({
    team,
    business,
    schedule,
    locations,
    services,
}: Props) {
    const { t } = useTranslation('company');
    const getInitials = useInitials();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-col gap-6 p-4">
                <Heading
                    variant="small"
                    title={t('title')}
                    description={t('description')}
                />

                <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Business — portrait tile (left, 1/4) */}
                    <BentoCard
                        href={editBusiness()}
                        mounted={mounted}
                        delay={0}
                        className="lg:col-span-1 lg:row-span-2"
                        icon={Building2}
                        accent={CARD_ACCENTS.business}
                        graphic={<BusinessGraphic />}
                        title={t('business.title')}
                        description={t('business.description')}
                    >
                        <div className="mt-auto flex flex-col gap-5">
                            <div className="flex items-center -space-x-2">
                                {business.people.map((person, index) => (
                                    <div
                                        key={person.name + index}
                                        className={cn(
                                            'flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white shadow-sm ring-2 ring-card transition-all duration-500',
                                            PRIMARY_GRADIENT,
                                            mounted
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-1 opacity-0',
                                        )}
                                        style={{
                                            transitionDelay: `${150 + index * 60}ms`,
                                        }}
                                    >
                                        {getInitials(person.name)}
                                    </div>
                                ))}
                                {business.total > business.people.length && (
                                    <div className="flex size-11 items-center justify-center rounded-xl border border-dashed bg-muted/50 text-xs font-semibold text-foreground/70 ring-2 ring-card">
                                        +
                                        {business.total -
                                            business.people.length}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tight tabular-nums">
                                        {business.total}
                                    </span>
                                    <span className="text-sm font-medium text-foreground/70">
                                        {t('business.stats', {
                                            member:
                                                business.total === 1
                                                    ? t(
                                                          'business.memberSingular',
                                                      )
                                                    : t(
                                                          'business.memberPlural',
                                                      ),
                                            roles: business.roles.length,
                                            roleWord:
                                                business.roles.length === 1
                                                    ? t('business.roleSingular')
                                                    : t('business.rolePlural'),
                                        })}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {business.roles.map((role) => (
                                        <span
                                            key={role.role}
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                                                role.role === 'owner'
                                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                                    : 'border-black/10 text-foreground/80 dark:border-border',
                                            )}
                                        >
                                            {role.label}
                                            {role.count > 1 && (
                                                <span className="opacity-60">
                                                    · {role.count}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Services — portrait tile (left, 1/4) */}
                    <BentoCard
                        href={servicesIndex()}
                        mounted={mounted}
                        delay={60}
                        className="lg:col-span-1 lg:row-span-2"
                        icon={Wrench}
                        accent={CARD_ACCENTS.services}
                        graphic={<ServicesGraphic />}
                        title={t('services.title')}
                        description={t('services.description')}
                    >
                        <div className="mt-auto flex flex-col gap-4">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tight tabular-nums">
                                        {services.count}
                                    </span>
                                    <span className="text-sm font-medium text-foreground/70">
                                        {services.count === 1
                                            ? t('services.serviceSingular')
                                            : t('services.servicePlural')}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs font-medium text-foreground/65">
                                    {services.categories}{' '}
                                    {services.categories === 1
                                        ? t('services.categorySingular')
                                        : t('services.categoryPlural')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {services.items.map((service, index) => (
                                    <div
                                        key={service.title + index}
                                        className="flex items-center gap-2.5 rounded-xl border border-black/[0.07] bg-card/70 px-3 py-2 backdrop-blur-[2px] transition-colors group-hover:border-primary/25 dark:border-border dark:bg-card/50"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0047b8] to-[#0063ff] text-white">
                                            <Sparkles className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-foreground">
                                                {service.title}
                                            </div>
                                            <div className="text-xs font-medium text-foreground/65">
                                                {service.duration} min
                                                {formatPrice(service.price)
                                                    ? ` · ${formatPrice(service.price)}`
                                                    : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {services.count === 0 && (
                                    <span className="text-sm font-medium text-foreground/70">
                                        {t('services.empty')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </BentoCard>

                    {/*
                        Schedule — availability for the next 7 days. Leads the
                        single-column phone layout, where the week ahead is what
                        an owner reaches for; from `sm` up the bento takes over
                        and it sits back in source order.
                    */}
                    <BentoCard
                        href={scheduleIndex()}
                        mounted={mounted}
                        delay={120}
                        className="order-first sm:order-none sm:col-span-2 lg:col-span-2"
                        icon={CalendarClock}
                        accent={CARD_ACCENTS.schedule}
                        graphic={<ScheduleGraphic />}
                        title={t('schedule.title')}
                        description={t('schedule.description')}
                    >
                        <ScheduleAvailabilityChart
                            schedule={schedule}
                            mounted={mounted}
                        />
                    </BentoCard>

                    {/* Locations */}
                    <BentoCard
                        href={locationsIndex()}
                        mounted={mounted}
                        delay={180}
                        className="lg:col-span-1"
                        icon={MapPin}
                        accent={CARD_ACCENTS.locations}
                        graphic={<LocationsGraphic />}
                        title={t('locations.title')}
                        compact
                    >
                        <div className="mt-auto">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight tabular-nums">
                                    {locations.count}
                                </span>
                                <span className="text-sm font-medium text-foreground/70">
                                    {locations.count === 1
                                        ? t('locations.locationSingular')
                                        : t('locations.locationPlural')}
                                </span>
                            </div>
                            {locations.cities.length > 0 && (
                                <p className="mt-1 truncate text-xs font-medium text-foreground/65">
                                    {locations.cities.join(' · ')}
                                </p>
                            )}
                        </div>
                    </BentoCard>

                    {/* Brand */}
                    <BentoCard
                        href={brandIndex()}
                        mounted={mounted}
                        delay={240}
                        className="lg:col-span-1"
                        icon={Palette}
                        accent={CARD_ACCENTS.brand}
                        graphic={<BrandGraphic />}
                        title={t('brand.title')}
                        compact
                    >
                        <div className="mt-auto flex items-center gap-2">
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm',
                                    PRIMARY_GRADIENT,
                                )}
                            >
                                {getInitials(team.name)}
                            </div>
                            <div className="size-10 rounded-xl bg-primary shadow-sm" />
                            <div className="size-10 rounded-xl bg-primary/50 shadow-sm" />
                            <div className="size-10 rounded-xl border border-dashed bg-muted/40" />
                        </div>
                    </BentoCard>
                </div>
            </div>
        </>
    );
}

type BentoCardProps = {
    href: React.ComponentProps<typeof Link>['href'];
    mounted: boolean;
    delay: number;
    className?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: AccentStyles;
    /** Decorative SVG painted behind the content; inherits the accent colour. */
    graphic?: React.ReactNode;
    title: string;
    description?: string;
    compact?: boolean;
    children?: React.ReactNode;
};

function BentoCard({
    href,
    mounted,
    delay,
    className,
    icon: Icon,
    accent,
    graphic,
    title,
    description,
    compact,
    children,
}: BentoCardProps) {
    return (
        <Link
            href={href}
            data-test="company-card"
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-card shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg dark:border-border',
                accent.ring,
                mounted
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
                className,
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Accent wash — a whisper of the card's hue in the top corner. */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent',
                    accent.wash,
                )}
            />

            {/* The card's own illustration, brightening slightly on hover. */}
            {graphic && (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 group-hover:opacity-80',
                        accent.graphic,
                    )}
                >
                    {graphic}
                </div>
            )}

            <div className="relative flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105',
                            compact ? 'size-9' : 'size-11',
                            accent.gradient,
                            accent.shadow,
                        )}
                    >
                        <Icon className={compact ? 'size-4' : 'size-5'} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="leading-tight font-semibold text-foreground">
                                {title}
                            </h3>
                            <ChevronRight className="size-4 shrink-0 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/80" />
                        </div>
                        {description && (
                            <p className="mt-1 text-sm leading-snug font-medium text-foreground/75">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="mt-5 flex flex-1 flex-col">{children}</div>
                )}
            </div>
        </Link>
    );
}

CompanyIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: companyIndex(),
        },
    ],
});

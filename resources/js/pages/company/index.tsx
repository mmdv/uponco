import { Head, Link, usePage } from '@inertiajs/react';
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

import Heading from '@/components/heading';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as companyIndex } from '@/routes/company';
import { index as brandIndex } from '@/routes/company/brand';
import { edit as editBusiness } from '@/routes/company/business';
import { index as locationsIndex } from '@/routes/company/locations';
import { index as servicesIndex } from '@/routes/company/services';
import { index as scheduleIndex } from '@/routes/schedule';

type Props = {
    team: { name: string };
    business: {
        total: number;
        roles: { role: string; label: string; count: number }[];
        people: { name: string; role: string }[];
    };
    schedule: {
        days: {
            key: string;
            label: string;
            minutes: number;
            isToday: boolean;
        }[];
        totalMinutes: number;
        openNow: boolean;
    };
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

/** Brand-primary gradient used for every avatar / icon tile across the page. */
const PRIMARY_GRADIENT = 'from-[#0063ff] to-[#3884fe]';

function formatHours(minutes: number): string {
    const hours = minutes / 60;

    return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

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
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const getInitials = useInitials();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));

        return () => cancelAnimationFrame(frame);
    }, []);

    const maxMinutes = Math.max(...schedule.days.map((day) => day.minutes), 1);

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
                        href={editBusiness(teamSlug)}
                        mounted={mounted}
                        delay={0}
                        className="lg:col-span-1 lg:row-span-2"
                        icon={Building2}
                        iconClassName="bg-primary-gradient text-white"
                        title={t('business.title')}
                        description={t('business.description')}
                    >
                        <div className="mt-auto flex flex-col gap-5 pt-8">
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
                                    <div className="flex size-11 items-center justify-center rounded-xl border border-dashed bg-muted/40 text-xs font-medium text-muted-foreground ring-2 ring-card">
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
                                    <span className="text-sm text-muted-foreground">
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
                                                    : 'text-muted-foreground',
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
                        href={servicesIndex(teamSlug)}
                        mounted={mounted}
                        delay={60}
                        className="lg:col-span-1 lg:row-span-2"
                        icon={Wrench}
                        title={t('services.title')}
                        description={t('services.description')}
                    >
                        <div className="mt-auto flex flex-col gap-4 pt-6">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold tracking-tight tabular-nums">
                                        {services.categories}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {services.categories === 1
                                            ? t('services.categorySingular')
                                            : t('services.categoryPlural')}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {services.count}{' '}
                                    {services.count === 1
                                        ? t('services.serviceSingular')
                                        : t('services.servicePlural')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {services.items.map((service, index) => (
                                    <div
                                        key={service.title + index}
                                        className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-3 py-2 transition-colors group-hover:border-primary/30"
                                    >
                                        <div
                                            className={cn(
                                                'flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                                                PRIMARY_GRADIENT,
                                            )}
                                        >
                                            <Sparkles className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">
                                                {service.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {service.duration} min
                                                {formatPrice(service.price)
                                                    ? ` · ${formatPrice(service.price)}`
                                                    : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {services.count === 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {t('services.empty')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Schedule — availability for the next 7 days */}
                    <BentoCard
                        href={scheduleIndex(teamSlug)}
                        mounted={mounted}
                        delay={120}
                        className="sm:col-span-2 lg:col-span-2"
                        icon={CalendarClock}
                        title={t('schedule.title')}
                        description={t('schedule.description')}
                    >
                        <div className="mt-6 flex items-end gap-2 sm:gap-3">
                            {schedule.days.map((day, index) => {
                                const ratio =
                                    day.minutes > 0
                                        ? Math.max(
                                              day.minutes / maxMinutes,
                                              0.12,
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={day.key}
                                        className="flex flex-1 flex-col items-center gap-2"
                                    >
                                        <div className="flex h-16 w-full items-end">
                                            <div className="relative w-full overflow-hidden rounded-md bg-muted/50">
                                                <div
                                                    className={cn(
                                                        'w-full rounded-md transition-[height] duration-700 ease-out',
                                                        day.isToday
                                                            ? 'bg-gradient-to-t from-[#0063ff] to-[#3884fe]'
                                                            : 'bg-primary/40',
                                                    )}
                                                    style={{
                                                        height: mounted
                                                            ? `${Math.max(ratio * 64, day.minutes > 0 ? 8 : 4)}px`
                                                            : '0px',
                                                        transitionDelay: `${index * 50}ms`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                'text-[11px] font-medium',
                                                day.isToday
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {day.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span
                                className={cn(
                                    'relative flex size-2 rounded-full',
                                    schedule.openNow
                                        ? 'bg-emerald-500'
                                        : 'bg-muted-foreground/40',
                                )}
                            >
                                {schedule.openNow && (
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                )}
                            </span>
                            <span className="text-muted-foreground">
                                {schedule.openNow
                                    ? t('schedule.openNow')
                                    : t('schedule.closedNow')}{' '}
                                ·{' '}
                                {t('schedule.hoursOverWeek', {
                                    hours: formatHours(schedule.totalMinutes),
                                })}
                            </span>
                        </div>
                    </BentoCard>

                    {/* Locations */}
                    <BentoCard
                        href={locationsIndex(teamSlug)}
                        mounted={mounted}
                        delay={180}
                        className="lg:col-span-1"
                        icon={MapPin}
                        title={t('locations.title')}
                        compact
                    >
                        <div className="mt-auto pt-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight tabular-nums">
                                    {locations.count}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {locations.count === 1
                                        ? t('locations.locationSingular')
                                        : t('locations.locationPlural')}
                                </span>
                            </div>
                            {locations.cities.length > 0 && (
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {locations.cities.join(' · ')}
                                </p>
                            )}
                        </div>
                    </BentoCard>

                    {/* Brand */}
                    <BentoCard
                        href={brandIndex(teamSlug)}
                        mounted={mounted}
                        delay={240}
                        className="lg:col-span-1"
                        icon={Palette}
                        title={t('brand.title')}
                        compact
                    >
                        <div className="mt-auto flex items-center gap-2 pt-6">
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
    iconClassName?: string;
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
    iconClassName,
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
                'group relative flex flex-col overflow-hidden rounded-2xl border border-[#f1f3f5] bg-card p-6 shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-primary/40 dark:border-border',
                mounted
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0',
                className,
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* subtle hover glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'flex shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                        compact ? 'size-9' : 'size-11',
                        iconClassName ?? 'bg-muted text-muted-foreground',
                    )}
                >
                    <Icon className={compact ? 'size-4' : 'size-5'} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="leading-tight font-semibold">{title}</h3>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </Link>
    );
}

CompanyIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Company',
            href: props.currentTeam
                ? companyIndex(props.currentTeam.slug)
                : '/',
        },
    ],
});

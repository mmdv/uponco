import {
    BellRing,
    Check,
    Clock,
    Globe,
    Layers,
    MapPin,
    Rocket,
    Users,
    Video,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/hooks/use-translation';

/**
 * One tile of the feature bento grid. `split` puts the copy and the visual
 * side by side for the wide tiles; otherwise the visual sits underneath the
 * copy and is pushed to the bottom so tiles in a row line up.
 */
function BentoCard({
    icon,
    i18nKey,
    className = '',
    split = false,
    children,
}: {
    icon: ReactNode;
    i18nKey: string;
    className?: string;
    split?: boolean;
    children: ReactNode;
}) {
    const { t } = useTranslation('features');

    const copy = (
        <div className={split ? 'lg:w-72 lg:shrink-0' : ''}>
            <h3 className="flex items-center gap-3 text-lg font-semibold">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    {icon}
                </span>
                {t(`bento.items.${i18nKey}.title`)}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-foreground/70">
                {t(`bento.items.${i18nKey}.description`)}
            </p>
        </div>
    );

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-8 shadow-sm backdrop-blur-md transition-colors duration-300 hover:border-primary/30 ${className}`}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />

            {split ? (
                <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
                    {copy}
                    <div className="w-full lg:flex-1">{children}</div>
                </div>
            ) : (
                <>
                    {copy}
                    <div className="mt-6 flex flex-1 items-end">{children}</div>
                </>
            )}
        </div>
    );
}

const bentoLocations = [
    { name: 'Downtown Studio', count: '14 today', active: true },
    { name: 'Riverside Branch', count: '9 today' },
    { name: 'Airport Mall', count: '11 today' },
];

const bentoServices = [
    'Haircut · 45m',
    'Deep massage · 60m',
    'Consultation · 30m',
    'Group yoga · 90m',
    'Coaching call · 45m',
];

const bentoOnboardingTaskKeys = [
    'locations',
    'services',
    'team',
    'link',
] as const;

/** Feature bento grid: every capability Uponco ships with, at a glance. */
export function FeatureBento() {
    const { t } = useTranslation('features');

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                    {t('bento.heading')}
                </h2>
                <p className="mt-4 text-lg text-foreground/80">
                    {t('bento.subheading')}
                </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <BentoCard
                    icon={<MapPin className="size-5" />}
                    i18nKey="multiLocation"
                    className="md:col-span-2"
                    split
                >
                    <div className="space-y-2.5">
                        {bentoLocations.map((location) => (
                            <div
                                key={location.name}
                                className={`flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5 transition-transform duration-300 group-hover:translate-x-0.5 ${
                                    location.active
                                        ? 'border-primary/40 shadow-soft'
                                        : 'border-border'
                                }`}
                            >
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <MapPin className="size-3.5 text-primary" />
                                    {location.name}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {location.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </BentoCard>

                <BentoCard
                    icon={<BellRing className="size-5" />}
                    i18nKey="reminders"
                >
                    <div className="w-full space-y-2.5">
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 shadow-soft">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <BellRing className="size-4 transition-transform duration-500 group-hover:rotate-12" />
                            </span>
                            <div>
                                <p className="text-xs font-semibold">
                                    Reminder · 24h before
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    “See you tomorrow at 10:30!”
                                </p>
                            </div>
                        </div>
                        <div className="mx-3 flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 opacity-70">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <BellRing className="size-4" />
                            </span>
                            <div>
                                <p className="text-xs font-semibold">
                                    Reminder · 1h before
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    “Your appointment starts soon.”
                                </p>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard
                    icon={<Layers className="size-5" />}
                    i18nKey="multiService"
                >
                    <div className="flex flex-wrap gap-2">
                        {bentoServices.map((service, i) => (
                            <span
                                key={service}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                                    i === 1
                                        ? 'border-primary/40 bg-primary/10 text-primary'
                                        : 'border-border bg-background text-muted-foreground'
                                }`}
                            >
                                <Clock className="size-3" />
                                {service}
                            </span>
                        ))}
                    </div>
                </BentoCard>

                <BentoCard
                    icon={<Users className="size-5" />}
                    i18nKey="individualGroup"
                >
                    <div className="w-full rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                                Morning yoga
                            </p>
                            <span className="text-xs text-muted-foreground">
                                Wed · 08:00
                            </span>
                        </div>
                        <div className="mt-3 flex -space-x-2">
                            {['AK', 'LM', 'JS', 'RB', 'TN', 'EC'].map(
                                (initials) => (
                                    <div
                                        key={initials}
                                        className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-semibold text-secondary-foreground"
                                    >
                                        {initials}
                                    </div>
                                ),
                            )}
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full w-3/4 rounded-full bg-primary transition-all duration-500 group-hover:w-full" />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t('bento.spotsFilled')}
                        </p>
                    </div>
                </BentoCard>

                <BentoCard
                    icon={<Globe className="size-5" />}
                    i18nKey="onlineOnsite"
                >
                    <div className="grid w-full grid-cols-2 gap-2.5">
                        <div className="rounded-lg border border-primary/40 bg-background p-4 shadow-soft">
                            <Video className="size-5 text-primary" />
                            <p className="mt-2.5 text-sm font-semibold">
                                {t('bento.online.title')}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('bento.online.description')}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-4">
                            <MapPin className="size-5 text-primary" />
                            <p className="mt-2.5 text-sm font-semibold">
                                {t('bento.onsite.title')}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('bento.onsite.description')}
                            </p>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard
                    icon={<Rocket className="size-5" />}
                    i18nKey="onboarding"
                    className="md:col-span-2 lg:col-span-3"
                    split
                >
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {bentoOnboardingTaskKeys.map((key) => (
                            <div
                                key={key}
                                className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-medium"
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="size-3" />
                                </span>
                                {t(`bento.onboardingTasks.${key}`)}
                            </div>
                        ))}
                    </div>
                </BentoCard>
            </div>
        </section>
    );
}

import { Head, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    CalendarPlus,
    Clock,
    MapPin,
    UsersRound,
    Video,
} from 'lucide-react';
import { BrandShowcase } from '@/components/marketing/home/brand-showcase';
import type { BrandPhone } from '@/components/marketing/home/brand-showcase';
import { CategoriesMarquee } from '@/components/marketing/home/categories-marquee';
import type { CategoryItem } from '@/components/marketing/home/categories-marquee';
import { EmbedSection } from '@/components/marketing/home/embed-section';
import { FeatureGrid } from '@/components/marketing/home/feature-grid';
import { FinalCtaSection } from '@/components/marketing/home/final-cta-section';
import { HeroSection } from '@/components/marketing/home/hero-section';
import { JourneyTrio } from '@/components/marketing/home/journey-trio';
import type { JourneyStep } from '@/components/marketing/home/journey-trio';
import { OperationsTabs } from '@/components/marketing/home/operations-tabs';
import type { OperationsTab } from '@/components/marketing/home/operations-tabs';
import type { SequenceScreen } from '@/components/marketing/home/phone-screen-sequence';
import { PricingSection } from '@/components/marketing/home/pricing-section';
import { PrivacySection } from '@/components/marketing/home/privacy-section';
import { screenSource } from '@/components/marketing/home/screens';
import type { ScreenName } from '@/components/marketing/home/screens';
import { TeamCalendarSection } from '@/components/marketing/home/team-calendar-section';
import { TestimonialsSection } from '@/components/marketing/home/testimonials-section';
import type { Testimonial } from '@/components/marketing/home/testimonials-section';
import { DEMO_TEAM_SLUG, SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslation } from '@/hooks/use-translation';
import { captureEvent } from '@/lib/analytics';
import { dashboard, pricing, register, yourData } from '@/routes';
import { show as publicBookingPage } from '@/routes/public/appointments';

/**
 * Real customer reviews for the testimonials row. Leave empty (and the flag
 * off) until there are genuine ones — never ship placeholder quotes.
 */
const SHOW_TESTIMONIALS = false;
const TESTIMONIALS: Testimonial[] = [];

/** The exact tag a business copies from Brand → Booking widget. */
const WIDGET_SNIPPET = `<script type="text/javascript"
  src="https://uponco.com/widget/your-business.js"
  charset="UTF-8"></script>`;

/** Business types in the marquee, split across its two rows. */
const CATEGORY_ROWS: [string[], string[]] = [
    [
        'hairdressers',
        'barbershops',
        'nailSalons',
        'lashesBrows',
        'massage',
        'spas',
        'yoga',
        'pilates',
        'personalTrainers',
        'dentalClinics',
        'physiotherapy',
        'psychologists',
    ],
    [
        'lifeCoaches',
        'vets',
        'petGrooming',
        'tutors',
        'languageSchools',
        'musicLessons',
        'drivingSchools',
        'photographers',
        'consultants',
        'carDetailing',
        'cleaning',
    ],
];

const BRAND_PHONES: { key: string; screen: ScreenName }[] = [
    { key: 'studioNorth', screen: 'brand-studio-north' },
    { key: 'lumenYoga', screen: 'brand-lumen-yoga' },
    { key: 'harborPhysio', screen: 'brand-harbor-physio' },
    { key: 'miraTutoring', screen: 'brand-mira-tutoring' },
];

const JOURNEY_STEPS = [
    { key: 'choose', screen: 'booking-specialist', icon: <Clock /> },
    { key: 'time', screen: 'yoga-time', icon: <UsersRound /> },
    { key: 'booked', screen: 'booking-confirmed', icon: <CalendarPlus /> },
] as const;

const OPERATIONS_TABS = [
    { key: 'hours', screen: 'working-hours', icon: <CalendarClock /> },
    { key: 'group', screen: 'yoga-services', icon: <Video /> },
    { key: 'locations', screen: 'physio-locations', icon: <MapPin /> },
    { key: 'team', screen: 'team-members', icon: <UsersRound /> },
] as const;

const FEATURE_KEYS = [
    'customers',
    'categories',
    'pricing',
    'breaks',
    'cancellation',
    'staffBookings',
    'theme',
    'languages',
    'twoFactor',
];

/**
 * Home page. Wires copy, links and analytics into the presentational sections
 * under components/marketing/home; the sections themselves hold no data.
 */
export default function Welcome() {
    const { t } = useTranslation('welcome');
    const { auth, currentTeam } = usePage().props;
    const isSignedIn = Boolean(auth.user);
    const startHref = isSignedIn
        ? currentTeam
            ? dashboard()
            : '/'
        : register();
    const startLabel = isSignedIn
        ? t('hero.ctaDashboard')
        : t('hero.ctaPrimary');
    const trackStart = (placement: string) =>
        isSignedIn
            ? undefined
            : () => captureEvent('get_started_clicked', { placement });

    const heroScreens: SequenceScreen[] = [
        {
            name: 'booking-choose',
            label: t('hero.steps.choose'),
            alt: t('hero.screens.choose'),
        },
        {
            name: 'booking-time',
            label: t('hero.steps.time'),
            alt: t('hero.screens.time'),
        },
        {
            name: 'booking-confirmed',
            label: t('hero.steps.booked'),
            alt: t('hero.screens.booked'),
        },
    ];
    const newBookingCard = {
        eyebrow: t('hero.cards.newBooking.eyebrow'),
        title: t('hero.cards.newBooking.title'),
        meta: t('hero.cards.newBooking.meta'),
    };

    const categoryRows = CATEGORY_ROWS.map((row) =>
        row.map((key): CategoryItem => ({
            key,
            label: t(`categories.items.${key}`),
        })),
    ) as [CategoryItem[], CategoryItem[]];

    const brandPhones: BrandPhone[] = BRAND_PHONES.map(({ key, screen }) => ({
        screen,
        caption: t(`brand.phones.${key}.caption`),
        alt: t(`brand.phones.${key}.alt`),
    }));

    const journeySteps: JourneyStep[] = JOURNEY_STEPS.map(
        ({ key, screen, icon }) => ({
            screen,
            title: t(`journey.steps.${key}.title`),
            body: t(`journey.steps.${key}.body`),
            alt: t(`journey.steps.${key}.alt`),
            card: {
                icon,
                title: t(`journey.steps.${key}.cardTitle`),
                meta: t(`journey.steps.${key}.cardMeta`),
            },
        }),
    );

    const operationsTabs: OperationsTab[] = OPERATIONS_TABS.map(
        ({ key, screen, icon }) => ({
            key,
            screen,
            icon,
            title: t(`operations.tabs.${key}.title`),
            body: t(`operations.tabs.${key}.body`),
            alt: t(`operations.tabs.${key}.alt`),
            card: {
                title: t(`operations.tabs.${key}.cardTitle`),
                meta: t(`operations.tabs.${key}.cardMeta`),
            },
        }),
    );

    const notice = (key: string) => ({
        eyebrow: t(`calendar.notices.${key}.eyebrow`),
        title: t(`calendar.notices.${key}.title`),
        meta: t(`calendar.notices.${key}.meta`),
    });

    return (
        <>
            <Head title={t('metaTitle')}>
                <link
                    head-key="hero-screen"
                    rel="preload"
                    as="image"
                    type="image/avif"
                    href={screenSource('booking-choose', 'avif')}
                    fetchPriority="high"
                />
            </Head>

            <div className="min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground">
                <SiteHeader floating />

                <main>
                    <HeroSection
                        copy={{
                            title: t('hero.title'),
                            subtitle: t('hero.subtitle'),
                            primaryCta: startLabel,
                            demoCta: t('hero.ctaDemo'),
                            trust: [
                                t('hero.trust.freeBeta'),
                                t('hero.trust.noCard'),
                                t('hero.trust.liveFast'),
                            ],
                            stepsLabel: t('hero.steps.label'),
                            cards: {
                                nextAvailable: {
                                    title: t('hero.cards.nextAvailable.title'),
                                    meta: t('hero.cards.nextAvailable.meta'),
                                },
                                calendar: {
                                    eyebrow: t('hero.cards.calendar.eyebrow'),
                                    title: t('hero.cards.calendar.title'),
                                },
                                newBooking: newBookingCard,
                                confirmation: {
                                    title: t('hero.cards.confirmation.title'),
                                    meta: t('hero.cards.confirmation.meta'),
                                },
                            },
                        }}
                        screens={heroScreens}
                        primaryHref={startHref}
                        demoHref={publicBookingPage(DEMO_TEAM_SLUG).url}
                        onPrimaryClick={trackStart('hero')}
                    />

                    <CategoriesMarquee
                        heading={t('categories.heading')}
                        rows={categoryRows}
                        worksWithLabel={t('categories.worksWithLabel')}
                        worksWith={[
                            'Google Calendar',
                            'Google Meet',
                            'Apple Calendar',
                        ]}
                    />

                    <BrandShowcase
                        title={t('brand.title')}
                        subtitle={t('brand.subtitle')}
                        phones={brandPhones}
                    />

                    <JourneyTrio
                        title={t('journey.title')}
                        subtitle={t('journey.subtitle')}
                        steps={journeySteps}
                    />

                    <TeamCalendarSection
                        title={t('calendar.title')}
                        body={t('calendar.body')}
                        points={[
                            t('calendar.points.oneCalendar'),
                            t('calendar.points.edits'),
                            t('calendar.points.alerts'),
                        ]}
                        alt={t('calendar.alt')}
                        notices={{
                            booked: notice('booked'),
                            moved: notice('moved'),
                            cancelled: notice('cancelled'),
                        }}
                    />

                    <EmbedSection
                        title={t('embed.title')}
                        body={t('embed.body')}
                        snippet={WIDGET_SNIPPET}
                        snippetLabel={t('embed.snippetLabel')}
                        siteName={t('embed.siteName')}
                        deepLinksTitle={t('embed.deepLinks.title')}
                        deepLinksBody={t('embed.deepLinks.body')}
                        alt={t('embed.alt')}
                    />

                    <OperationsTabs
                        title={t('operations.title')}
                        subtitle={t('operations.subtitle')}
                        tabs={operationsTabs}
                    />

                    <FeatureGrid
                        title={t('features.title')}
                        subtitle={t('features.subtitle')}
                        items={FEATURE_KEYS.map((key) => ({
                            key,
                            title: t(`features.items.${key}.title`),
                            body: t(`features.items.${key}.body`),
                        }))}
                    />

                    <PrivacySection
                        title={t('privacy.title')}
                        body={t('privacy.body')}
                        finePrint={t('privacy.finePrint')}
                        cta={t('privacy.cta')}
                        href={yourData()}
                        alt={t('privacy.alt')}
                    />

                    <PricingSection
                        banner={t('pricing.banner')}
                        title={t('pricing.title')}
                        subtitle={t('pricing.subtitle')}
                        plans={[
                            {
                                name: t('pricing.free.name'),
                                price: t('pricing.free.price'),
                                period: t('pricing.free.period'),
                                caption: t('pricing.free.caption'),
                                features: [
                                    t('pricing.free.features.appointments'),
                                    t('pricing.free.features.everything'),
                                    t('pricing.free.features.noCard'),
                                ],
                                highlighted: true,
                            },
                            {
                                name: t('pricing.perUser.name'),
                                price: t('pricing.perUser.price'),
                                period: t('pricing.perUser.period'),
                                caption: t('pricing.perUser.caption'),
                                features: [
                                    t('pricing.perUser.features.unlimited'),
                                    t('pricing.perUser.features.everything'),
                                    t('pricing.perUser.features.cancel'),
                                ],
                            },
                        ]}
                        note={t('pricing.note')}
                        cta={t('pricing.cta')}
                        href={pricing()}
                    />

                    {SHOW_TESTIMONIALS && (
                        <TestimonialsSection
                            title={t('testimonials.title')}
                            testimonials={TESTIMONIALS}
                        />
                    )}

                    <FinalCtaSection
                        title={t('finalCta.title')}
                        subtitle={t('finalCta.subtitle')}
                        cta={startLabel}
                        href={startHref}
                        onCtaClick={trackStart('final_cta')}
                        alts={{
                            booking: t('finalCta.alts.booking'),
                            confirmed: t('finalCta.alts.confirmed'),
                            calendar: t('finalCta.alts.calendar'),
                        }}
                        newBooking={newBookingCard}
                    />
                </main>

                <SiteFooter maxWidth="max-w-7xl" />
            </div>
        </>
    );
}

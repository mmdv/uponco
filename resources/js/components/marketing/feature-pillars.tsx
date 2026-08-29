import {
    CalendarCheck,
    Check,
    Globe,
    Link2,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/hooks/use-translation';

/** Small decorative sketch shown opposite the first pillar. */
function BookingLinkSketch() {
    const { t } = useTranslation('features');

    return (
        <div className="w-full max-w-xs">
            <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-border" />
                    <span className="size-2 rounded-full bg-border" />
                    <span className="size-2 rounded-full bg-border" />
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <Globe className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate text-xs text-muted-foreground">
                        uponco.app/
                        <span className="font-medium text-foreground">
                            bella-salon
                        </span>
                    </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {['Haircut', 'Colour', 'Shave'].map((service, i) => (
                        <span
                            key={service}
                            className={`rounded-md border px-2 py-1.5 text-center text-[10px] font-medium ${
                                i === 0
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground'
                            }`}
                        >
                            {service}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                {t('sketches.liveForCustomers')}
            </div>
        </div>
    );
}

/** Small decorative sketch shown opposite the second pillar. */
function SharedCalendarSketch() {
    const { t } = useTranslation('features');

    /** Column, row and span of each booking drawn on the mini week grid. */
    const bookings = [
        { col: 1, row: 1, span: 2, tone: 'bg-primary' },
        { col: 2, row: 3, span: 1, tone: 'bg-primary/70' },
        { col: 3, row: 2, span: 2, tone: 'bg-primary/50' },
        { col: 5, row: 1, span: 1, tone: 'bg-primary/70' },
        { col: 5, row: 4, span: 1, tone: 'bg-primary' },
    ];

    return (
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                    {t('sketches.thisWeek')}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Users className="size-3 text-primary" />
                    {t('sketches.fourPeople')}
                </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
                {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <span
                        key={`${day}-${i}`}
                        className="text-center text-[10px] text-muted-foreground"
                    >
                        {day}
                    </span>
                ))}
            </div>
            <div className="mt-1.5 grid grid-cols-5 grid-rows-5 gap-1.5">
                {Array.from({ length: 25 }).map((_, i) => (
                    <span
                        key={i}
                        className="h-3.5 rounded-sm bg-secondary"
                        style={{
                            gridColumn: (i % 5) + 1,
                            gridRow: Math.floor(i / 5) + 1,
                        }}
                    />
                ))}
                {bookings.map((booking) => (
                    <span
                        key={`${booking.col}-${booking.row}`}
                        className={`rounded-sm ${booking.tone}`}
                        style={{
                            gridColumn: booking.col,
                            gridRow: `${booking.row} / span ${booking.span}`,
                        }}
                    />
                ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="size-3 text-primary" />
                {t('sketches.noDoubleBookings')}
            </p>
        </div>
    );
}

/** Small decorative sketch shown opposite the third pillar. */
function LessAdminSketch() {
    const { t } = useTranslation('features');

    const handledForYou = [
        t('sketches.handled.reminders'),
        t('sketches.handled.slots'),
        t('sketches.handled.noPhoneTag'),
    ];

    return (
        <div className="w-full max-w-xs space-y-2">
            {handledForYou.map((task, i) => (
                <div
                    key={task}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-medium shadow-xs"
                    style={{ marginLeft: `${i * 0.75}rem` }}
                >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                    </span>
                    {task}
                </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                {t('sketches.inTheBackground')}
            </p>
        </div>
    );
}

const pillars: {
    icon: ReactNode;
    i18nKey: string;
    paragraphKey: string;
    sketch: ReactNode;
}[] = [
    {
        icon: <Link2 className="size-6" />,
        i18nKey: 'bookingPage',
        paragraphKey: 'paragraphOne',
        sketch: <BookingLinkSketch />,
    },
    {
        icon: <CalendarCheck className="size-6" />,
        i18nKey: 'sharedCalendar',
        paragraphKey: 'paragraphTwo',
        sketch: <SharedCalendarSketch />,
    },
    {
        icon: <Sparkles className="size-6" />,
        i18nKey: 'lessAdmin',
        paragraphKey: 'paragraphThree',
        sketch: <LessAdminSketch />,
    },
];

/** The three pillars, each with a small sketch and tied to a centre rail. */
export function FeaturePillars() {
    const { t } = useTranslation('features');

    return (
        <section className="relative mx-auto w-full max-w-7xl px-6 py-10 sm:py-14">
            <div
                aria-hidden
                className="pointer-events-none absolute top-10 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
            />

            <div className="relative">
                {/* Centre rail with a light travelling down it, tying
                    the alternating pillars together on wide screens. */}
                <span
                    aria-hidden
                    className="absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 overflow-hidden bg-border lg:block"
                >
                    <span className="absolute inset-x-0 top-0 h-1/4 animate-rail-flow bg-gradient-to-b from-transparent via-primary to-transparent motion-reduce:animate-none" />
                </span>

                <ol className="space-y-8 lg:space-y-14">
                    {pillars.map((pillar, i) => {
                        const flipped = i % 2 === 1;

                        return (
                            <li
                                key={pillar.i18nKey}
                                className="group relative grid items-center gap-6 lg:grid-cols-2 lg:gap-16"
                            >
                                {/* Node sitting on the centre rail */}
                                <span
                                    aria-hidden
                                    className="absolute top-1/2 left-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary transition-transform duration-300 group-hover:scale-125 lg:block"
                                />

                                <div
                                    className={`relative rounded-3xl border border-border/50 bg-card/60 p-8 shadow-sm backdrop-blur-md transition-colors duration-300 hover:border-primary/30 sm:pl-24 ${
                                        flipped ? 'lg:order-2' : ''
                                    }`}
                                >
                                    <span className="relative flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-xs transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground sm:absolute sm:top-8 sm:left-6">
                                        {pillar.icon}
                                    </span>
                                    <h2 className="mt-5 text-xl font-semibold sm:mt-0">
                                        {t(`pillars.${pillar.i18nKey}`)}
                                    </h2>
                                    <p className="mt-2 text-base leading-relaxed text-foreground/70">
                                        {t(pillar.paragraphKey)}
                                    </p>
                                </div>

                                <div
                                    aria-hidden
                                    className={`flex justify-center transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:transform-none ${
                                        flipped
                                            ? 'lg:order-1 lg:justify-end'
                                            : 'lg:justify-start'
                                    }`}
                                >
                                    {pillar.sketch}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}

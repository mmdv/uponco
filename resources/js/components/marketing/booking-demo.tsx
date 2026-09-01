import { BellRing, CalendarClock, Check, Scissors, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useTranslation } from '@/hooks/use-translation';

const demoDays = [
    { label: 'Today', day: '14', month: 'Jul' },
    { label: 'Tmrw', day: '15', month: 'Jul' },
    { label: 'Wed', day: '16', month: 'Jul' },
    { label: 'Thu', day: '17', month: 'Jul' },
    { label: 'Fri', day: '18', month: 'Jul' },
];
const demoSlots = ['09:00', '09:45', '10:30', '11:15', '13:00', '13:45'];

const demoChipClass =
    'inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium shadow-xs';

/**
 * Looping mini booking flow shown in the hero, styled after the real public
 * booking page: a slot gets picked, the booking confirms, then a reminder
 * toast pops in — and it starts over.
 */
export function BookingDemo() {
    const { t } = useTranslation('welcome');
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setStep((s) => (s + 1) % 4), 1700);

        return () => clearInterval(id);
    }, []);

    const slotPicked = step >= 1;
    const confirmed = step >= 2;
    const reminderSent = step >= 3;

    return (
        <div className="relative mx-auto w-full max-w-sm">
            <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl"
            />

            <div className="rounded-2xl border border-border bg-background p-5 shadow-soft">
                {/* Mirrors BookingHeader: logo tile, company name, tagline */}
                <div className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </span>
                    <div>
                        <p className="text-sm leading-tight font-semibold">
                            Uponco
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {t('demo.bookAppointment')}
                        </p>
                    </div>
                </div>

                {/* Mirrors SummaryBar: choices pop in as chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className={demoChipClass}>
                        <Scissors className="size-3.5 shrink-0 text-primary" />
                        Haircut · 45 min
                    </span>
                    <span className={demoChipClass}>
                        <User className="size-3.5 shrink-0 text-primary" />
                        Emma
                    </span>
                    {slotPicked && (
                        <span
                            className={`${demoChipClass} animate-in duration-300 zoom-in-95 fade-in motion-reduce:animate-none`}
                        >
                            <CalendarClock className="size-3.5 shrink-0 text-primary" />
                            Wed, 10:30
                        </span>
                    )}
                </div>

                {/* The step content stays mounted (hidden) while confirmed so
                    the card keeps its height and the page never shifts. */}
                <div className="relative mt-4">
                    {confirmed && (
                        /* Mirrors SuccessScreen. The animation is delayed
                           (with backwards fill) until the step content has
                           fully faded out, so the two never overlap. */
                        <div className="absolute inset-0 flex animate-in items-center justify-center delay-250 duration-500 fill-mode-backwards zoom-in-95 fade-in motion-reduce:animate-none">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="size-5" />
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold">
                                    {t('demo.bookedIn')}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Haircut · Wed, Jul 16 · 10:30
                                </p>
                            </div>
                        </div>
                    )}

                    <div
                        className={`flex flex-col transition-opacity duration-200 ${
                            confirmed ? 'opacity-0' : 'opacity-100'
                        }`}
                    >
                        {/* Mirrors StepDateTime: day strip + slot grid */}
                        <p className="text-sm font-medium">
                            {t('demo.chooseDay')}
                        </p>
                        <div className="mt-2 flex gap-1.5 sm:gap-2">
                            {demoDays.map((day, i) => (
                                <div
                                    key={day.day}
                                    className={`flex flex-1 basis-0 flex-col items-center rounded-xl border py-2.5 transition-colors ${
                                        i === 2
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <span
                                        className={`text-[11px] ${
                                            i === 2
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {day.label}
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {day.day}
                                    </span>
                                    <span
                                        className={`text-[11px] ${
                                            i === 2
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {day.month}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-sm font-medium">
                            {t('demo.chooseTime')}
                        </p>
                        <div className="mt-2 mb-4 grid grid-cols-3 gap-2">
                            {demoSlots.map((slot, i) => (
                                <div
                                    key={slot}
                                    className={`rounded-lg border py-2 text-center text-sm font-medium transition-all duration-200 ${
                                        slotPicked && i === 2
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    {slot}
                                </div>
                            ))}
                        </div>

                        {/* Mirrors BookingFooter's primary action */}
                        <div
                            className={`mt-auto flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity duration-300 ${
                                slotPicked ? '' : 'opacity-50'
                            }`}
                        >
                            {slotPicked
                                ? t('demo.confirmBooking')
                                : t('demo.continue')}
                        </div>
                    </div>
                </div>
            </div>

            {reminderSent && (
                <div className="absolute -top-4 -right-3 flex animate-in items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium shadow-soft duration-300 fade-in slide-in-from-top-2 motion-reduce:animate-none">
                    <BellRing className="size-3.5 text-primary" />
                    {t('demo.reminderSent')}
                </div>
            )}
        </div>
    );
}

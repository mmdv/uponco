import { Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';

import { ACCENTS } from '@/components/accents';
import { AgendaGraphic } from '@/components/card-graphics';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import {
    appointmentCustomerLabel,
    dayLabel,
    formatAppointmentTimeRange,
} from '@/lib/appointments';
import { cn } from '@/lib/utils';
import { index as appointmentsIndex } from '@/routes/appointments';
import type { UpcomingAppointment } from '@/types';

/**
 * Card chrome from `md` up only. On a phone the padding and border of a card
 * cost more width than they earn, so the list runs edge to edge instead.
 */
const CARD_FROM_MD =
    'md:rounded-2xl md:border md:border-black/[0.08] md:bg-card md:py-6 md:text-card-foreground md:shadow-soft md:dark:border-border';

/** The appointments list carries the sky accent across the dashboard. */
const STYLES = ACCENTS.brand;

type Props = {
    appointments: UpcomingAppointment[];
    onAddAppointment: () => void;
    onView: (appointment: UpcomingAppointment) => void;
};

export default function UpcomingAppointments({
    appointments,
    onAddAppointment,
    onView,
}: Props) {
    const { t } = useTranslation('dashboard');

    return (
        <section
            className={cn('relative max-w-full overflow-hidden', CARD_FROM_MD)}
        >
            {/* Accent wash and diary illustration, card chrome only. */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 hidden bg-gradient-to-br via-transparent to-transparent md:block',
                    STYLES.wash,
                )}
            />
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 hidden overflow-hidden md:block',
                    STYLES.graphic,
                )}
            >
                <AgendaGraphic />
            </div>

            <div className="relative space-y-4 md:px-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">
                        {t('upcoming.title')}
                    </h3>
                    {appointments.length > 0 && (
                        <Link
                            href={appointmentsIndex.url()}
                            className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                        >
                            {t('upcoming.viewAll')}
                        </Link>
                    )}
                </div>

                {appointments.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <div
                            className={cn(
                                'mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                                STYLES.gradient,
                                STYLES.shadow,
                            )}
                        >
                            <CalendarClock className="size-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground/75">
                            {t('upcoming.empty')}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={onAddAppointment}
                        >
                            {t('upcoming.bookAppointment')}
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {appointments.map((appointment) => (
                            <li
                                key={appointment.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onView(appointment)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        onView(appointment);
                                    }
                                }}
                                className="group flex cursor-pointer items-stretch gap-3 rounded-xl border border-black/[0.08] bg-card/70 p-3 backdrop-blur-[2px] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm dark:border-border dark:bg-card/50"
                            >
                                <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#0063ff] to-[#3884fe]" />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="truncate text-sm font-semibold">
                                        {appointment.service.title}
                                    </p>
                                    <p className="truncate text-sm font-medium text-foreground/70">
                                        {appointmentCustomerLabel(
                                            appointment,
                                            t('upcoming.noName'),
                                        )}
                                        {appointment.location
                                            ? ` · ${appointment.location.name}`
                                            : ''}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-xs font-semibold">
                                        {dayLabel(
                                            appointment.start_at,
                                            appointment.timezone,
                                        )}
                                    </p>
                                    <p className="text-xs font-medium text-foreground/65">
                                        {formatAppointmentTimeRange(
                                            appointment.start_at,
                                            appointment.end_at,
                                            appointment.timezone,
                                        )}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

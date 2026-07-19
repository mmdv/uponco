import { Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { dayLabel, formatAppointmentTimeRange } from '@/lib/appointments';
import { index as appointmentsIndex } from '@/routes/appointments';
import type { UpcomingAppointment } from '@/types';

type Props = {
    appointments: UpcomingAppointment[];
    teamSlug: string;
    onAddAppointment: () => void;
    onView: (appointment: UpcomingAppointment) => void;
};

export default function UpcomingAppointments({
    appointments,
    teamSlug,
    onAddAppointment,
    onView,
}: Props) {
    const { t } = useTranslation('dashboard');

    return (
        <Card className="max-w-full">
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium">
                        {t('upcoming.title')}
                    </h3>
                    {appointments.length > 0 && (
                        <Link
                            href={appointmentsIndex.url(teamSlug)}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t('upcoming.viewAll')}
                        </Link>
                    )}
                </div>

                {appointments.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-sm">
                            <CalendarClock className="size-5" />
                        </div>
                        <p className="text-sm text-muted-foreground">
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
                                className="group flex cursor-pointer items-stretch gap-3 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                            >
                                <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#0063ff] to-[#3884fe]" />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="truncate text-sm font-medium">
                                        {appointment.service.title}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {appointment.customer.name}
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
                                    <p className="text-xs text-muted-foreground">
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
            </CardContent>
        </Card>
    );
}

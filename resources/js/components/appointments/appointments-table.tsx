import { CalendarX, MoreHorizontal, Pencil, Search } from 'lucide-react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTranslation } from '@/hooks/use-translation';
import {
    appointmentDurationMinutes,
    formatAppointmentTime,
    formatDuration,
    groupAppointmentsByDay,
} from '@/lib/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointments: Appointment[];
    onView: (appointment: Appointment) => void;
    onEdit: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
    onViewCustomer: (appointment: Appointment) => void;
    /** Whether the appointment may be edited/cancelled; read-only rows show only View. */
    canModify?: (appointment: Appointment) => boolean;
    /** Show the "@ location" line under the service — hidden when only one location exists. */
    showLocation: boolean;
    /** Show the specialist column — hidden when the team has a single member. */
    showSpecialist: boolean;
    emptyMessage?: string;
};

export default function AppointmentsTable({
    appointments,
    onView,
    onEdit,
    onCancel,
    onViewCustomer,
    canModify = () => true,
    showLocation,
    showSpecialist,
    emptyMessage,
}: Props) {
    const { t } = useTranslation('appointments');

    if (appointments.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    {emptyMessage ?? t('table.empty')}
                </p>
            </div>
        );
    }

    const groups = groupAppointmentsByDay(appointments);
    // Time, Service, Customer, [Specialist], Actions.
    const columnCount = showSpecialist ? 5 : 4;

    return (
        <div className="rounded-lg border">
            <Table containerClassName="overscroll-x-none">
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('table.time')}</TableHead>
                        <TableHead>{t('table.service')}</TableHead>
                        <TableHead>{t('table.customer')}</TableHead>
                        {showSpecialist ? (
                            <TableHead>{t('table.specialist')}</TableHead>
                        ) : null}
                        <TableHead className="sticky right-0 z-20 w-0 border-l bg-background text-right">
                            <span className="sr-only">
                                {t('table.actions')}
                            </span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <Fragment key={group.key}>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableCell
                                    colSpan={columnCount}
                                    className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                                >
                                    {group.label}
                                </TableCell>
                            </TableRow>

                            {group.appointments.map((appointment) => (
                                <TableRow
                                    key={appointment.id}
                                    data-test="appointment-row"
                                    className="group/row cursor-pointer"
                                    onClick={() => onView(appointment)}
                                >
                                    <TableCell className="align-top">
                                        <div className="font-medium">
                                            {formatAppointmentTime(
                                                appointment.start_at,
                                                appointment.timezone,
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDuration(
                                                appointmentDurationMinutes(
                                                    appointment,
                                                ),
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="font-medium">
                                            {appointment.service.title}
                                        </div>
                                        {showLocation ? (
                                            <div className="text-xs text-muted-foreground">
                                                @{' '}
                                                {appointment.location?.name ??
                                                    t('table.online')}
                                            </div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <button
                                            type="button"
                                            data-test="appointment-customer-button"
                                            className="text-left font-medium hover:text-primary hover:underline"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onViewCustomer(appointment);
                                            }}
                                        >
                                            {appointment.customer.name}
                                        </button>
                                    </TableCell>
                                    {showSpecialist ? (
                                        <TableCell className="align-top text-muted-foreground">
                                            {appointment.specialist.name}
                                        </TableCell>
                                    ) : null}
                                    <TableCell className="sticky right-0 z-10 border-l bg-background text-right align-top group-hover/row:bg-muted/50">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    data-test="appointment-menu-button"
                                                    aria-label={t(
                                                        'table.actions',
                                                    )}
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <DropdownMenuItem
                                                    data-test="appointment-view-button"
                                                    onSelect={() =>
                                                        onView(appointment)
                                                    }
                                                >
                                                    <Search className="size-4" />
                                                    {t('table.viewDetails')}
                                                </DropdownMenuItem>
                                                {canModify(appointment) && (
                                                    <>
                                                        <DropdownMenuItem
                                                            data-test="appointment-edit-button"
                                                            onSelect={() =>
                                                                onEdit(
                                                                    appointment,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                            {t(
                                                                'table.editAppointment',
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            data-test="appointment-cancel-button"
                                                            onSelect={() =>
                                                                onCancel(
                                                                    appointment,
                                                                )
                                                            }
                                                        >
                                                            <CalendarX className="size-4" />
                                                            {t(
                                                                'table.cancelAppointment',
                                                            )}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

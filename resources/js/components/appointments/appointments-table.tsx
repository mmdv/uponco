import {
    CalendarX,
    MoreHorizontal,
    Pencil,
    Search,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { Fragment } from 'react';

import { Badge } from '@/components/ui/badge';
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
import { useCustomerTerm } from '@/hooks/use-customer-term';
import { useTranslation } from '@/hooks/use-translation';
import {
    appointmentCustomerLabel,
    appointmentDurationMinutes,
    appointmentHasCustomer,
    formatAppointmentTime,
    formatDuration,
    groupAppointmentsByDay,
    isPastAppointment,
} from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

type Props = {
    appointments: Appointment[];
    onView: (appointment: Appointment) => void;
    onEdit: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
    onViewCustomer: (appointment: Appointment) => void;
    onMarkNoShow?: (appointment: Appointment) => void;
    onUndoNoShow?: (appointment: Appointment) => void;
    onDelete?: (appointment: Appointment) => void;
    /** Whether the appointment may be edited/cancelled; read-only rows show only View. */
    canModify?: (appointment: Appointment) => boolean;
    /** Whether past-only actions (no-show, delete) are available for the row. */
    canManagePast?: (appointment: Appointment) => boolean;
    /** Show the "@ location" line under the service — hidden when only one location exists. */
    showLocation: boolean;
    /** Show the specialist column — hidden when the team has a single member. */
    showSpecialist: boolean;
    /**
     * Bucket rows under per-day header rows. Off for the single-day minimal view,
     * where the day switcher already names the day.
     */
    groupByDay?: boolean;
    emptyMessage?: string;
};

export default function AppointmentsTable({
    appointments,
    onView,
    onEdit,
    onCancel,
    onViewCustomer,
    onMarkNoShow,
    onUndoNoShow,
    onDelete,
    canModify = () => true,
    canManagePast = () => false,
    showLocation,
    showSpecialist,
    groupByDay = true,
    emptyMessage,
}: Props) {
    const { t } = useTranslation('appointments');
    const customerTerm = useCustomerTerm();

    if (appointments.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-foreground">
                    {emptyMessage ?? t('table.empty')}
                </p>
            </div>
        );
    }

    // With day grouping off (single-day view) the rows render as one flat list
    // under no header; the day switcher above already names the day.
    const groups = groupByDay
        ? groupAppointmentsByDay(appointments)
        : [{ key: 'all', label: '', appointments }];
    // Time, Service, Customer, [Specialist], Actions.
    const columnCount = showSpecialist ? 5 : 4;

    return (
        <div className="rounded-lg border">
            <Table containerClassName="overscroll-x-none">
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('table.time')}</TableHead>
                        <TableHead>{t('table.service')}</TableHead>
                        <TableHead>{customerTerm}</TableHead>
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
                            {groupByDay ? (
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableCell
                                        colSpan={columnCount}
                                        className="py-2 text-xs font-medium tracking-wide text-foreground"
                                    >
                                        {group.label}
                                    </TableCell>
                                </TableRow>
                            ) : null}

                            {group.appointments.map((appointment) => (
                                <TableRow
                                    key={appointment.id}
                                    data-test="appointment-row"
                                    data-past={
                                        isPastAppointment(appointment) ||
                                        undefined
                                    }
                                    className={cn(
                                        'group/row cursor-pointer',
                                        // Bookings the customer made themselves are
                                        // tinted green so they stand out in the list.
                                        appointment.source === 'public' &&
                                            'bg-emerald-500/5 hover:bg-emerald-500/10',
                                        // Past appointments read as done: dimmed and muted.
                                        isPastAppointment(appointment) &&
                                            'text-muted-foreground opacity-60',
                                        // A no-show is flagged in rose; it wins over the
                                        // source tint above.
                                        appointment.status === 'no_show' &&
                                            'bg-rose-500/5 hover:bg-rose-500/10',
                                    )}
                                    onClick={() => onView(appointment)}
                                >
                                    <TableCell className="align-top">
                                        <div className="font-medium">
                                            {formatAppointmentTime(
                                                appointment.start_at,
                                                appointment.timezone,
                                            )}
                                        </div>
                                        <div className="text-xs text-foreground">
                                            {formatDuration(
                                                appointmentDurationMinutes(
                                                    appointment,
                                                ),
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {appointment.service.title}
                                            </span>
                                            {appointment.status ===
                                                'no_show' && (
                                                <Badge
                                                    variant="destructive"
                                                    className="shrink-0"
                                                >
                                                    {t('status.noShow')}
                                                </Badge>
                                            )}
                                        </div>
                                        {showLocation ? (
                                            <div className="text-xs text-foreground">
                                                @{' '}
                                                {appointment.location?.name ??
                                                    t('table.online')}
                                            </div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        {appointmentHasCustomer(appointment) ? (
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
                                        ) : (
                                            <span className="font-medium text-foreground">
                                                {appointmentCustomerLabel(
                                                    appointment,
                                                    t('customer.noName'),
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                    {showSpecialist ? (
                                        <TableCell className="align-top text-foreground">
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
                                                {canManagePast(appointment) && (
                                                    <>
                                                        {appointment.status ===
                                                        'no_show' ? (
                                                            <DropdownMenuItem
                                                                data-test="appointment-undo-no-show-button"
                                                                onSelect={() =>
                                                                    onUndoNoShow?.(
                                                                        appointment,
                                                                    )
                                                                }
                                                            >
                                                                <UserCheck className="size-4" />
                                                                {t(
                                                                    'table.undoNoShow',
                                                                )}
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                data-test="appointment-no-show-button"
                                                                onSelect={() =>
                                                                    onMarkNoShow?.(
                                                                        appointment,
                                                                    )
                                                                }
                                                            >
                                                                <UserX className="size-4" />
                                                                {t(
                                                                    'table.markNoShow',
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            data-test="appointment-delete-button"
                                                            onSelect={() =>
                                                                onDelete?.(
                                                                    appointment,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                            {t(
                                                                'table.deleteAppointment',
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

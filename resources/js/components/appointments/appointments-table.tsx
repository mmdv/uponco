import { Pencil, Search, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    formatAppointmentTimeRange,
    groupAppointmentsByDay,
} from '@/lib/appointments';
import type { Appointment } from '@/types';

type Props = {
    appointments: Appointment[];
    onView: (appointment: Appointment) => void;
    onEdit: (appointment: Appointment) => void;
    onDelete: (appointment: Appointment) => void;
    /** Whether the appointment may be edited/deleted; read-only rows show only View. */
    canModify?: (appointment: Appointment) => boolean;
    emptyMessage?: string;
};

export default function AppointmentsTable({
    appointments,
    onView,
    onEdit,
    onDelete,
    canModify = () => true,
    emptyMessage = 'No appointments yet. Book your first appointment to get started.',
}: Props) {
    if (appointments.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    const groups = groupAppointmentsByDay(appointments);

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Specialist</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <Fragment key={group.key}>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableCell
                                    colSpan={5}
                                    className="py-2 text-xs font-medium tracking-wide text-muted-foreground"
                                >
                                    {group.label}
                                </TableCell>
                            </TableRow>

                            {group.appointments.map((appointment) => (
                                <TableRow
                                    key={appointment.id}
                                    data-test="appointment-row"
                                >
                                    <TableCell className="font-medium">
                                        {formatAppointmentTimeRange(
                                            appointment.start_at,
                                            appointment.end_at,
                                            appointment.timezone,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {appointment.service.title}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {appointment.location?.name ?? 'Online'}
                                    </TableCell>
                                    <TableCell>
                                        {appointment.specialist.name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            data-test="appointment-view-button"
                                                            onClick={() =>
                                                                onView(
                                                                    appointment,
                                                                )
                                                            }
                                                        >
                                                            <Search className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {canModify(appointment) && (
                                                    <>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    data-test="appointment-edit-button"
                                                                    onClick={() =>
                                                                        onEdit(
                                                                            appointment,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Edit
                                                                    appointment
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    data-test="appointment-delete-button"
                                                                    onClick={() =>
                                                                        onDelete(
                                                                            appointment,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="size-4 text-destructive" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    Delete
                                                                    appointment
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </TooltipProvider>
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

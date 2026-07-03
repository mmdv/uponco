import { Calendar, Clock, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
    formatAppointmentDay,
    formatAppointmentTimeRange,
} from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canEdit?: boolean;
    onEdit?: (appointment: Appointment) => void;
};

export default function AppointmentDetailsModal({
    appointment,
    open,
    onOpenChange,
    canEdit = false,
    onEdit,
}: Props) {
    const isOnline = appointment ? appointment.location === null : false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                {appointment && (
                    <>
                        <DialogHeader className="gap-1.5 border-b bg-muted/30 p-6">
                            <Badge
                                variant={isOnline ? 'default' : 'secondary'}
                                className="mb-1 capitalize"
                            >
                                {isOnline ? 'Online' : 'In person'}
                            </Badge>
                            <DialogTitle className="text-xl leading-tight">
                                {appointment.service.title}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                with {appointment.specialist.name}
                            </p>
                        </DialogHeader>

                        <div className="space-y-6 p-6">
                            <section className="grid grid-cols-2 gap-4">
                                <InfoTile
                                    icon={<Calendar className="size-4" />}
                                    label="Date"
                                    value={formatAppointmentDay(
                                        appointment.start_at,
                                        appointment.timezone,
                                    )}
                                />
                                <InfoTile
                                    icon={<Clock className="size-4" />}
                                    label="Time"
                                    value={formatAppointmentTimeRange(
                                        appointment.start_at,
                                        appointment.end_at,
                                        appointment.timezone,
                                    )}
                                />
                                <InfoTile
                                    icon={<MapPin className="size-4" />}
                                    label="Location"
                                    value={
                                        appointment.location?.name ?? 'Online'
                                    }
                                    className="col-span-2"
                                />
                            </section>

                            <Separator />

                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Customer
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarFallback>
                                            {getInitials(
                                                appointment.customer.name,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {appointment.customer.name}
                                        </p>
                                        <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                                            {appointment.customer.email && (
                                                <ContactLink
                                                    icon={
                                                        <Mail className="size-3.5" />
                                                    }
                                                    href={`mailto:${appointment.customer.email}`}
                                                    text={
                                                        appointment.customer
                                                            .email
                                                    }
                                                />
                                            )}
                                            {appointment.customer.phone && (
                                                <ContactLink
                                                    icon={
                                                        <Phone className="size-3.5" />
                                                    }
                                                    href={`tel:${appointment.customer.phone}`}
                                                    text={
                                                        appointment.customer
                                                            .phone
                                                    }
                                                />
                                            )}
                                            {!appointment.customer.email &&
                                                !appointment.customer.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="size-3.5" />
                                                        No contact details
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {appointment.notes && (
                                <>
                                    <Separator />
                                    <section className="space-y-2">
                                        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Notes
                                        </h3>
                                        <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                            {appointment.notes}
                                        </p>
                                    </section>
                                </>
                            )}
                        </div>

                        <DialogFooter className="border-t p-4">
                            <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                            </DialogClose>
                            {canEdit && onEdit && (
                                <Button
                                    data-test="appointment-details-edit-button"
                                    onClick={() => onEdit(appointment)}
                                >
                                    <Pencil /> Edit
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function InfoTile({
    icon,
    label,
    value,
    className,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('rounded-lg border p-3', className)}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
                {icon}
                <span className="text-xs font-medium tracking-wide uppercase">
                    {label}
                </span>
            </div>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

function ContactLink({
    icon,
    href,
    text,
}: {
    icon: React.ReactNode;
    href: string;
    text: string;
}) {
    return (
        <a
            href={href}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
            {icon}
            <span className="truncate">{text}</span>
        </a>
    );
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

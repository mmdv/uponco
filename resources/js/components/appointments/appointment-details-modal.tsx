import {
    Calendar,
    Clock,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Trash2,
    User,
    UserX,
} from 'lucide-react';

import GoogleMeetIcon from '@/components/icons/google-meet-icon';
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
import { useCustomerTerm } from '@/hooks/use-customer-term';
import { useTranslation } from '@/hooks/use-translation';
import {
    appointmentCustomerLabel,
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
    /** Whether the viewer may run past-only actions (no-show, delete) on this one. */
    canManagePast?: boolean;
    onEdit?: (appointment: Appointment) => void;
    onMarkNoShow?: (appointment: Appointment) => void;
    onUndoNoShow?: (appointment: Appointment) => void;
    onDelete?: (appointment: Appointment) => void;
};

export default function AppointmentDetailsModal({
    appointment,
    open,
    onOpenChange,
    canEdit = false,
    canManagePast = false,
    onEdit,
    onMarkNoShow,
    onUndoNoShow,
    onDelete,
}: Props) {
    const { t } = useTranslation('appointments');
    const customerTerm = useCustomerTerm();
    const isOnline = appointment ? appointment.location === null : false;
    const isNoShow = appointment?.status === 'no_show';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                {appointment && (
                    <>
                        <DialogHeader className="shrink-0 gap-1.5 border-b bg-muted/30 p-6">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={isOnline ? 'default' : 'secondary'}
                                    className="capitalize"
                                >
                                    {isOnline
                                        ? t('details.online')
                                        : t('details.inPerson')}
                                </Badge>
                                {appointment.source === 'public' && (
                                    <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                        {t('onlineBooking')}
                                    </Badge>
                                )}
                                {isNoShow && (
                                    <Badge variant="destructive">
                                        {t('status.noShow')}
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle className="text-xl leading-tight">
                                {appointment.service.title}
                            </DialogTitle>
                            <p className="text-sm text-foreground">
                                {t('details.with', {
                                    name: appointment.specialist.name,
                                })}
                            </p>
                        </DialogHeader>

                        <div className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto p-6">
                            <section className="grid grid-cols-2 gap-4">
                                <InfoTile
                                    icon={<Calendar className="size-4" />}
                                    label={t('details.date')}
                                    value={formatAppointmentDay(
                                        appointment.start_at,
                                        appointment.timezone,
                                    )}
                                />
                                <InfoTile
                                    icon={<Clock className="size-4" />}
                                    label={t('details.time')}
                                    value={formatAppointmentTimeRange(
                                        appointment.start_at,
                                        appointment.end_at,
                                        appointment.timezone,
                                    )}
                                />
                                <InfoTile
                                    icon={<MapPin className="size-4" />}
                                    label={t('details.location')}
                                    value={
                                        appointment.location?.name ??
                                        t('details.online')
                                    }
                                    className="col-span-2"
                                />
                            </section>

                            {isOnline && appointment.meeting_url && (
                                <a
                                    href={appointment.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-test="appointment-meeting-link"
                                    className="flex w-full max-w-full flex-wrap items-center gap-3 rounded-lg border border-[#00832d]/30 bg-[#00832d]/5 p-3 transition-colors hover:bg-[#00832d]/10"
                                >
                                    <GoogleMeetIcon className="size-6 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">
                                            {t('details.meeting')}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {appointment.meeting_url}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[#00832d] px-3 py-1 text-xs font-semibold text-white">
                                        {t('details.join')}
                                    </span>
                                </a>
                            )}

                            <Separator />

                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                    {customerTerm}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarFallback>
                                            {getInitials(
                                                appointmentCustomerLabel(
                                                    appointment,
                                                    t('customer.noName'),
                                                ),
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {appointmentCustomerLabel(
                                                appointment,
                                                t('customer.noName'),
                                            )}
                                        </p>
                                        <div className="mt-1 flex flex-col gap-1 text-sm text-foreground">
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
                                                        {t('details.noContact')}
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
                                        <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                            {t('details.notes')}
                                        </h3>
                                        <p className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                            {appointment.notes}
                                        </p>
                                    </section>
                                </>
                            )}
                        </div>

                        {canManagePast ? (
                            <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t p-4">
                                {onDelete ? (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        data-test="appointment-details-delete-button"
                                        aria-label={t('details.delete')}
                                        title={t('details.delete')}
                                        onClick={() => onDelete(appointment)}
                                    >
                                        <Trash2 />
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                {isNoShow
                                    ? onUndoNoShow && (
                                          <Button
                                              variant="outline"
                                              data-test="appointment-details-undo-no-show-button"
                                              onClick={() =>
                                                  onUndoNoShow(appointment)
                                              }
                                          >
                                              {t('details.undoNoShow')}
                                          </Button>
                                      )
                                    : onMarkNoShow && (
                                          <Button
                                              variant="warning"
                                              data-test="appointment-details-no-show-button"
                                              onClick={() =>
                                                  onMarkNoShow(appointment)
                                              }
                                          >
                                              <UserX /> {t('details.markNoShow')}
                                          </Button>
                                      )}
                            </DialogFooter>
                        ) : (
                            <DialogFooter className="shrink-0 border-t p-4">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        className="w-full sm:w-auto"
                                    >
                                        {t('details.close')}
                                    </Button>
                                </DialogClose>
                                {canEdit && onEdit && (
                                    <Button
                                        className="w-full sm:w-auto"
                                        data-test="appointment-details-edit-button"
                                        onClick={() => onEdit(appointment)}
                                    >
                                        <Pencil /> {t('details.edit')}
                                    </Button>
                                )}
                            </DialogFooter>
                        )}
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
            <div className="flex items-center gap-1.5 text-foreground">
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

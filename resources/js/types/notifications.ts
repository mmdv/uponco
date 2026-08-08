/** The three appointment events that produce a notification. */
export type NotificationAlert = 'booked' | 'rescheduled' | 'cancelled';

/**
 * One stored notification, as shaped by `NotificationController` and by the
 * shared `notifications` prop in `HandleInertiaRequests`.
 *
 * The appointment details are denormalised into the row at send time, so they
 * survive the underlying service or customer being deleted later.
 */
export type AppNotification = {
    id: string;
    read: boolean;
    created_at: string | null;
    alert: NotificationAlert;
    appointment_id: number;
    service_title: string | null;
    customer_name: string | null;
    location_name: string | null;
    specialist_id: number;
    specialist_name: string;
    start_at: string;
    timezone: string;
};

/** The header bell's payload: the unread badge plus what the drawer lists. */
export type NotificationSummary = {
    unread: number;
    items: AppNotification[];
};

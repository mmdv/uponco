import { NotificationItem } from 'uponco';

const base = {
    appointment_id: 4821,
    location_name: 'Nizami Studio',
    timezone: 'Asia/Baku',
    specialist_id: 1,
    specialist_name: 'Leyla Hüseynova',
};

const booked = {
    ...base,
    id: 'a1',
    read: false,
    created_at: null,
    alert: 'booked' as const,
    service_title: 'Deep Tissue Massage',
    customer_name: 'Ayla Rzayeva',
    start_at: '2026-08-18T07:30:00Z',
};

const rescheduled = {
    ...base,
    id: 'a2',
    read: true,
    created_at: null,
    alert: 'rescheduled' as const,
    service_title: 'Gel Manicure',
    customer_name: 'Kamran Səfərov',
    start_at: '2026-08-19T11:00:00Z',
};

const cancelled = {
    ...base,
    id: 'a3',
    read: true,
    created_at: null,
    alert: 'cancelled' as const,
    service_title: 'Signature Cut & Finish',
    customer_name: 'Səbinə Quliyeva',
    start_at: '2026-08-17T13:15:00Z',
};

/** One unread booking alert, as the notification drawer lists it. */
export function Default() {
    return (
        <div className="max-w-md">
            <NotificationItem notification={booked} currentUserId={1} />
        </div>
    );
}

/** The three alert kinds, each with its own icon and tint. */
export function AlertKinds() {
    return (
        <div className="max-w-md space-y-1">
            <NotificationItem notification={booked} currentUserId={1} />
            <NotificationItem notification={rescheduled} currentUserId={1} />
            <NotificationItem notification={cancelled} currentUserId={1} />
        </div>
    );
}

/** Read rows drop the accent wash; unread keep it. */
export function ReadAndUnread() {
    return (
        <div className="max-w-md space-y-1">
            <NotificationItem notification={booked} currentUserId={1} />
            <NotificationItem
                notification={{ ...booked, id: 'a4', read: true }}
                currentUserId={1}
            />
        </div>
    );
}

/**
 * A manager reading someone else's booking — the specialist's name is appended
 * to the headline because the reader is not the specialist.
 */
export function SeenByManager() {
    return (
        <div className="max-w-md">
            <NotificationItem notification={booked} currentUserId={9} />
        </div>
    );
}

/** The service and customer were deleted after the alert was sent. */
export function DeletedRecords() {
    return (
        <div className="max-w-md">
            <NotificationItem
                notification={{
                    ...booked,
                    id: 'a5',
                    service_title: null,
                    customer_name: null,
                }}
                currentUserId={1}
            />
        </div>
    );
}

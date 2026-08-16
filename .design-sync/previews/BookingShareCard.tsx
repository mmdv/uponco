import { BookingShareCard } from 'uponco';

/**
 * The dashboard's right rail: book someone in yourself with the primary button,
 * or hand out the public link so customers can book themselves.
 */
export function Default() {
    return (
        <div className="max-w-xs">
            <BookingShareCard
                companyName="Aurora Beauty Studio"
                onAddAppointment={() => undefined}
            />
        </div>
    );
}

/**
 * Tailing the single column on mobile, where the card gets the full page width
 * and the share link no longer has to truncate.
 */
export function FullWidthColumn() {
    return (
        <div className="max-w-lg">
            <BookingShareCard
                companyName="Aurora Beauty Studio"
                onAddAppointment={() => undefined}
            />
        </div>
    );
}

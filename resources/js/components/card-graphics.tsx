/**
 * Decorative illustrations sitting behind the dashboard and company cards.
 * Each is drawn in `currentColor` at a low opacity, so a card sets the hue by
 * placing the matching `ACCENTS[…].graphic` class on the wrapper. They are
 * purely ornamental — always render them behind the content and `aria-hidden`.
 */

/** Team — a small org tree, one node branching into two. */
export function BusinessGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -top-4 -right-6 size-36 opacity-[0.14]"
        >
            <path
                d="M60 22v26M26 82V58h68v24"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle cx="60" cy="18" r="8" fill="currentColor" />
            <circle cx="26" cy="88" r="8" fill="currentColor" />
            <circle cx="94" cy="88" r="8" fill="currentColor" />
        </svg>
    );
}

/** Services — a catalogue grid, fading out toward the edge. */
export function ServicesGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="currentColor"
            aria-hidden="true"
            className="absolute -top-5 -right-7 size-36 opacity-[0.16]"
        >
            {[0, 1, 2, 3].map((row) =>
                [0, 1, 2, 3].map((col) => (
                    <rect
                        key={`${row}-${col}`}
                        x={col * 30 + 4}
                        y={row * 30 + 4}
                        width="22"
                        height="22"
                        rx="7"
                        opacity={1 - (row + col) * 0.13}
                    />
                )),
            )}
        </svg>
    );
}

/** Locations — radar rings sweeping out from a dropped pin. */
export function LocationsGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -right-8 -bottom-10 size-40 opacity-[0.16]"
        >
            <circle
                cx="60"
                cy="60"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
            />
            <circle
                cx="60"
                cy="60"
                r="30"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.7"
            />
            <circle
                cx="60"
                cy="60"
                r="46"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.45"
            />
            <circle cx="60" cy="60" r="5" fill="currentColor" />
        </svg>
    );
}

/** Brand — overlapping ink blots, like mixing two swatches. */
export function BrandGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="currentColor"
            aria-hidden="true"
            className="absolute -top-8 -right-8 size-40 opacity-[0.15]"
        >
            <circle cx="46" cy="52" r="34" opacity="0.75" />
            <circle cx="82" cy="72" r="28" opacity="0.5" />
            <circle cx="86" cy="30" r="16" opacity="0.9" />
        </svg>
    );
}

/** Customers — a cluster of overlapping head-and-shoulders silhouettes. */
export function CustomersGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="currentColor"
            aria-hidden="true"
            className="absolute -right-5 -bottom-7 size-28 opacity-[0.14]"
        >
            <circle cx="42" cy="42" r="18" />
            <path d="M10 100a32 32 0 0 1 64 0z" />
            <circle cx="86" cy="52" r="14" opacity="0.6" />
            <path d="M60 100a26 26 0 0 1 52 0z" opacity="0.6" />
        </svg>
    );
}

/** Total bookings — a stack of filed cards, the ledger of everything booked. */
export function BookingsGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -right-6 -bottom-8 size-28 opacity-[0.16]"
        >
            <rect
                x="12"
                y="18"
                width="86"
                height="26"
                rx="8"
                fill="currentColor"
                opacity="0.4"
            />
            <rect
                x="20"
                y="50"
                width="86"
                height="26"
                rx="8"
                fill="currentColor"
                opacity="0.7"
            />
            <rect
                x="28"
                y="82"
                width="86"
                height="26"
                rx="8"
                fill="currentColor"
            />
        </svg>
    );
}

/** Upcoming — a clock face leaning into the corner. */
export function UpcomingGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -right-7 -bottom-9 size-28 opacity-[0.16]"
        >
            <circle
                cx="60"
                cy="60"
                r="44"
                stroke="currentColor"
                strokeWidth="5"
            />
            <path
                d="M60 32v30l20 12"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Week ahead — a rising trend line over a faint baseline grid. */
export function TrendGraphic() {
    return (
        <svg
            viewBox="0 0 200 120"
            fill="none"
            aria-hidden="true"
            className="absolute -top-6 -right-8 h-40 w-64 opacity-[0.13]"
        >
            <path
                d="M8 96 54 62l34 22 40-46 56-24"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M156 12h36v36"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />
        </svg>
    );
}

/** Appointments list — a diary page ruled with day entries. */
export function AgendaGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -top-8 -right-8 size-44 opacity-[0.1]"
        >
            <rect
                x="14"
                y="22"
                width="92"
                height="84"
                rx="12"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                d="M38 14v16M82 14v16M14 48h92"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M32 66h34M32 84h52"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.7"
            />
        </svg>
    );
}

/** Company hub — a building block stack, the pieces you assemble. */
export function CompanyGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="currentColor"
            aria-hidden="true"
            className="absolute -top-6 -right-6 size-36 opacity-[0.13]"
        >
            <rect x="8" y="60" width="44" height="44" rx="12" opacity="0.55" />
            <rect x="60" y="60" width="44" height="44" rx="12" opacity="0.8" />
            <rect x="34" y="10" width="44" height="44" rx="12" />
        </svg>
    );
}

/** Schedule — a dashed week ruler running under the availability bars. */
export function ScheduleGraphic() {
    return (
        <svg
            viewBox="0 0 400 120"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-32 w-full opacity-[0.13]"
        >
            {[0, 1, 2, 3].map((line) => (
                <line
                    key={line}
                    x1="0"
                    x2="400"
                    y1={line * 30 + 15}
                    y2={line * 30 + 15}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="3 9"
                />
            ))}
        </svg>
    );
}

/** Booking link — concentric broadcast arcs radiating from the corner. */
export function ShareGraphic() {
    return (
        <svg
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="absolute -right-6 -bottom-8 size-40 opacity-[0.16]"
        >
            <circle cx="60" cy="60" r="6" fill="currentColor" />
            <circle
                cx="60"
                cy="60"
                r="22"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.8"
            />
            <circle
                cx="60"
                cy="60"
                r="38"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.55"
            />
            <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.3"
            />
        </svg>
    );
}

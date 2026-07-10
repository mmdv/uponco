/**
 * Shared sizing for the scheduling grid. The day-cell width is a fixed pixel
 * value (kept in sync with {@link DAY_CELL_CLASS}) so the horizontal scroll can
 * be anchored to a given column with simple arithmetic.
 */
export const DAY_CELL_WIDTH = 64;

/** Tailwind width for a single day column (matches {@link DAY_CELL_WIDTH}). */
export const DAY_CELL_CLASS = 'w-16 shrink-0';

/** Tailwind width for the fixed member column (narrow + stacked on mobile). */
export const MEMBER_COL_CLASS = 'w-16 shrink-0 sm:w-44';

/** Row height for a member row / day cell (min 64px). */
export const ROW_HEIGHT_CLASS = 'h-16';

/** Height of the day-header row (and the member-column spacer above it). */
export const HEADER_HEIGHT_CLASS = 'h-16';

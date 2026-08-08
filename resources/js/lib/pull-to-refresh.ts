/**
 * Pure geometry behind the pull-to-refresh gesture, kept out of the hook so it
 * can be reasoned about — and tested — without a DOM or a touch screen.
 */

/** How far the indicator must travel before a release triggers the reload. */
export const PULL_THRESHOLD = 72;

/** Ceiling on the indicator's travel — pulling further changes nothing. */
export const MAX_PULL = 108;

/** Share of the finger's travel the indicator follows, for a damped feel. */
export const RESISTANCE = 0.5;

/** Slop before a gesture commits to an axis, so taps don't arm the pull. */
export const DIRECTION_LOCK = 8;

/**
 * Which gesture a touch has turned out to be.
 *
 * `undecided` means it hasn't left the slop yet and may still become either;
 * `abandoned` is final, so a swipe that starts sideways or upwards can never
 * turn into a pull halfway through.
 */
export type GestureAxis = 'undecided' | 'vertical' | 'abandoned';

/**
 * Classify a touch from how far it has moved since it started. Downward travel
 * that clears the slop first is ours; anything else belongs to the page.
 */
export function resolveGestureAxis(
    deltaX: number,
    deltaY: number,
): GestureAxis {
    if (Math.abs(deltaY) < DIRECTION_LOCK) {
        return Math.abs(deltaX) >= DIRECTION_LOCK ? 'abandoned' : 'undecided';
    }

    if (deltaY < 0 || Math.abs(deltaX) > Math.abs(deltaY)) {
        return 'abandoned';
    }

    return 'vertical';
}

/** Convert finger travel into indicator travel: damped, and capped. */
export function dampenPull(deltaY: number): number {
    if (deltaY <= 0) {
        return 0;
    }

    return Math.min(deltaY * RESISTANCE, MAX_PULL);
}

/** Whether releasing at this distance should reload the page. */
export function shouldRefresh(distance: number): boolean {
    return distance >= PULL_THRESHOLD;
}

/** How far along the pull is, 0 to 1, for the indicator's fade and spin. */
export function pullProgress(distance: number): number {
    if (distance <= 0) {
        return 0;
    }

    return Math.min(distance / PULL_THRESHOLD, 1);
}

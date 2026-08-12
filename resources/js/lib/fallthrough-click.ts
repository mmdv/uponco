/**
 * Guards a clickable container against the synthetic "fall-through" click that
 * Radix menus leave behind.
 *
 * When a dropdown menu item is chosen with a pointer, the menu closes on
 * pointer-up and the browser then dispatches a click that lands on whatever now
 * sits under the cursor — typically the clickable row the menu was opened from.
 * Left unguarded, that stray click re-fires the row's own handler (e.g. opening
 * an edit drawer while a delete dialog is also opening).
 *
 * Call {@link FallthroughClickGuard.markActionTaken} when a menu item runs, and
 * gate the row handler on {@link FallthroughClickGuard.shouldHandleClick}. A
 * click arriving within {@link FALLTHROUGH_WINDOW_MS} of a menu action is
 * treated as the stray one and swallowed; anything later is a genuine click.
 * Using a short time window (rather than a sticky flag) means a keyboard
 * selection, which produces no fall-through click, never suppresses the user's
 * next real click.
 */
export const FALLTHROUGH_WINDOW_MS = 350;

export type FallthroughClickGuard = {
    /** Record that a menu action just ran, arming suppression. */
    markActionTaken: () => void;
    /**
     * Decide whether a row click should run. Returns false for the stray
     * fall-through click, true otherwise. Each call consumes the armed state.
     */
    shouldHandleClick: () => boolean;
};

/**
 * Create a {@link FallthroughClickGuard}. The clock is injectable for testing.
 */
export function createFallthroughClickGuard(
    now: () => number = () => Date.now(),
): FallthroughClickGuard {
    let armedAt = Number.NEGATIVE_INFINITY;

    return {
        markActionTaken() {
            armedAt = now();
        },
        shouldHandleClick() {
            const isFallthrough = now() - armedAt < FALLTHROUGH_WINDOW_MS;
            armedAt = Number.NEGATIVE_INFINITY;

            return !isFallthrough;
        },
    };
}

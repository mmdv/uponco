import { describe, expect, it } from 'vitest';

import {
    createFallthroughClickGuard,
    FALLTHROUGH_WINDOW_MS,
} from '@/lib/fallthrough-click';

describe('createFallthroughClickGuard', () => {
    it('handles a click when no menu action preceded it', () => {
        const guard = createFallthroughClickGuard(() => 1000);

        expect(guard.shouldHandleClick()).toBe(true);
    });

    it('swallows the fall-through click that immediately follows a menu action', () => {
        let time = 1000;
        const guard = createFallthroughClickGuard(() => time);

        guard.markActionTaken();
        time += 1; // synthetic click arrives in the same tick

        expect(guard.shouldHandleClick()).toBe(false);
    });

    it('suppresses only a single click per menu action', () => {
        let time = 1000;
        const guard = createFallthroughClickGuard(() => time);

        guard.markActionTaken();
        expect(guard.shouldHandleClick()).toBe(false);

        // A later, genuine click still runs.
        time += FALLTHROUGH_WINDOW_MS + 1;
        expect(guard.shouldHandleClick()).toBe(true);
    });

    it('does not suppress a genuine click long after the menu action', () => {
        let time = 1000;
        const guard = createFallthroughClickGuard(() => time);

        // Keyboard selection arms the guard but yields no fall-through click.
        guard.markActionTaken();
        time += FALLTHROUGH_WINDOW_MS;

        expect(guard.shouldHandleClick()).toBe(true);
    });
});

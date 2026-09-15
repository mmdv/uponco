import { afterEach, describe, expect, it, vi } from 'vitest';

import { createNetworkErrorHandler } from '@/lib/network-error';

function setOnline(online: boolean): void {
    vi.stubGlobal('navigator', { onLine: online });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('createNetworkErrorHandler', () => {
    it('always cancels the event so the error is not re-thrown as an unhandled rejection', () => {
        setOnline(true);
        const preventDefault = vi.fn();
        const notifyOffline = vi.fn();

        createNetworkErrorHandler({ notifyOffline })({ preventDefault });

        expect(preventDefault).toHaveBeenCalledOnce();
    });

    it('notifies the user when the device is offline', () => {
        setOnline(false);
        const preventDefault = vi.fn();
        const notifyOffline = vi.fn();

        createNetworkErrorHandler({ notifyOffline })({ preventDefault });

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(notifyOffline).toHaveBeenCalledOnce();
    });

    it('stays silent on a transient failure while still online', () => {
        setOnline(true);
        const notifyOffline = vi.fn();

        createNetworkErrorHandler({ notifyOffline })({
            preventDefault: vi.fn(),
        });

        expect(notifyOffline).not.toHaveBeenCalled();
    });
});

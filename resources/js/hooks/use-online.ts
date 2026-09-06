import { useSyncExternalStore } from 'react';

/**
 * Tracks the browser's online/offline state.
 *
 * Backed by `useSyncExternalStore` so it reads `navigator.onLine` synchronously
 * and re-renders on the `online`/`offline` events. On the server there is no
 * `navigator`, so the snapshot defaults to online — the offline UI only ever
 * needs to appear once the app is running in the browser.
 */
const subscribe = (callback: () => void): (() => void) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);

    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
};

const getSnapshot = (): boolean => navigator.onLine;

const getServerSnapshot = (): boolean => true;

/** `true` while the browser reports a network connection. */
export function useOnline(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

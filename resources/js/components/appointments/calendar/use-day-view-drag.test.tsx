// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Appointment } from '@/types';

import { LONG_PRESS_MS, useDayViewDrag } from './use-day-view-drag';

const appointment = {
    id: 7,
    specialist_id: 3,
    start_at: '2030-01-10T10:00:00Z',
    end_at: '2030-01-10T11:00:00Z',
} as Appointment;

function pointer(
    type: string,
    coords: { clientX?: number; clientY?: number } = {},
): React.PointerEvent {
    const target = document.createElement('button');
    target.setPointerCapture = vi.fn();
    target.hasPointerCapture = vi.fn(() => true);
    target.releasePointerCapture = vi.fn();

    return {
        type,
        button: 0,
        pointerId: 1,
        clientX: coords.clientX ?? 10,
        clientY: coords.clientY ?? 200,
        currentTarget: target,
        preventDefault: vi.fn(),
    } as unknown as React.PointerEvent;
}

function setup() {
    const columnEl = document.createElement('div');
    const onReschedule = vi.fn();

    const view = renderHook(() =>
        useDayViewDrag({
            dayKey: '2030-01-10',
            timezone: 'UTC',
            appointments: [appointment],
            columnRefs: { current: new Map([[3, columnEl]]) },
            onReschedule,
        }),
    );

    const press = () =>
        act(() => {
            view.result.current.beginDrag(pointer('pointerdown'), {
                appointment,
                top: 192,
            });
        });

    return { view, press, onReschedule };
}

describe('useDayViewDrag long press', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('only starts the drag after the handle is held for the full delay', () => {
        const { view, press } = setup();

        press();

        expect(view.result.current.pressingId).toBe(7);
        expect(view.result.current.drag).toBeNull();

        act(() => {
            vi.advanceTimersByTime(LONG_PRESS_MS - 1);
        });

        expect(view.result.current.drag).toBeNull();

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(view.result.current.pressingId).toBeNull();
        expect(view.result.current.drag?.appointment.id).toBe(7);
        expect(view.result.current.drop).not.toBeNull();
    });

    it('cancels without rescheduling when released before the delay', () => {
        const { view, press, onReschedule } = setup();

        press();

        act(() => {
            vi.advanceTimersByTime(LONG_PRESS_MS / 2);
            view.result.current.endDrag(pointer('pointerup'));
            vi.advanceTimersByTime(LONG_PRESS_MS);
        });

        expect(view.result.current.pressingId).toBeNull();
        expect(view.result.current.drag).toBeNull();
        expect(onReschedule).not.toHaveBeenCalled();
    });

    it('cancels when the pointer moves away while holding', () => {
        const { view, press } = setup();

        press();

        act(() => {
            view.result.current.moveDrag(
                pointer('pointermove', { clientY: 240 }),
            );
            vi.advanceTimersByTime(LONG_PRESS_MS);
        });

        expect(view.result.current.pressingId).toBeNull();
        expect(view.result.current.drag).toBeNull();
    });

    it('tolerates a small wobble while holding', () => {
        const { view, press } = setup();

        press();

        act(() => {
            view.result.current.moveDrag(
                pointer('pointermove', { clientY: 203 }),
            );
            vi.advanceTimersByTime(LONG_PRESS_MS);
        });

        expect(view.result.current.drag?.appointment.id).toBe(7);
    });
});

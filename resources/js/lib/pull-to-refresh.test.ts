import { describe, expect, it } from 'vitest';

import {
    DIRECTION_LOCK,
    MAX_PULL,
    PULL_THRESHOLD,
    dampenPull,
    pullProgress,
    resolveGestureAxis,
    shouldRefresh,
} from '@/lib/pull-to-refresh';

describe('resolveGestureAxis', () => {
    it('waits inside the slop before committing', () => {
        expect(resolveGestureAxis(0, 0)).toBe('undecided');
        expect(resolveGestureAxis(2, DIRECTION_LOCK - 1)).toBe('undecided');
    });

    it('claims a downward drag that clears the slop', () => {
        expect(resolveGestureAxis(0, DIRECTION_LOCK)).toBe('vertical');
        expect(resolveGestureAxis(4, 40)).toBe('vertical');
    });

    it('abandons upward drags', () => {
        expect(resolveGestureAxis(0, -DIRECTION_LOCK)).toBe('abandoned');
        expect(resolveGestureAxis(0, -60)).toBe('abandoned');
    });

    it('abandons a sideways swipe that clears the slop first', () => {
        expect(resolveGestureAxis(DIRECTION_LOCK, 0)).toBe('abandoned');
        expect(resolveGestureAxis(-30, 2)).toBe('abandoned');
    });

    it('abandons a diagonal drag that leans horizontal', () => {
        expect(resolveGestureAxis(50, 30)).toBe('abandoned');
    });
});

describe('dampenPull', () => {
    it('follows half the finger travel', () => {
        expect(dampenPull(40)).toBe(20);
        expect(dampenPull(100)).toBe(50);
    });

    it('caps the travel however hard the pull', () => {
        expect(dampenPull(10_000)).toBe(MAX_PULL);
    });

    it('never reports travel for an upward drag', () => {
        expect(dampenPull(0)).toBe(0);
        expect(dampenPull(-80)).toBe(0);
    });

    it('can reach the threshold before hitting the cap', () => {
        expect(dampenPull(PULL_THRESHOLD * 2)).toBe(PULL_THRESHOLD);
        expect(MAX_PULL).toBeGreaterThan(PULL_THRESHOLD);
    });
});

describe('shouldRefresh', () => {
    it('fires at the threshold and beyond', () => {
        expect(shouldRefresh(PULL_THRESHOLD)).toBe(true);
        expect(shouldRefresh(MAX_PULL)).toBe(true);
    });

    it('does not fire on a short pull', () => {
        expect(shouldRefresh(0)).toBe(false);
        expect(shouldRefresh(PULL_THRESHOLD - 1)).toBe(false);
    });
});

describe('pullProgress', () => {
    it('runs from nothing to full across the threshold', () => {
        expect(pullProgress(0)).toBe(0);
        expect(pullProgress(PULL_THRESHOLD / 2)).toBe(0.5);
        expect(pullProgress(PULL_THRESHOLD)).toBe(1);
    });

    it('stays at full once past the threshold', () => {
        expect(pullProgress(MAX_PULL)).toBe(1);
    });
});

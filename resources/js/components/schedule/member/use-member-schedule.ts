import { router } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/hooks/use-translation';
import { dateKey } from '@/lib/calendar-grid';
import { shiftAnchor, viewDays, viewRange } from '@/lib/member-schedule';
import { update as updateMemberSchedule } from '@/routes/schedule/member';
import type {
    DayScheduleMap,
    MemberScheduleView,
    ScheduleDayPayload,
    ScheduleSlot,
} from '@/types/schedule';

/** Stable empty map, so an absent slot map doesn't churn memo dependencies. */
const EMPTY_SLOTS: DayScheduleMap = {};

type UseMemberScheduleOptions = {
    memberId: number;
    /** Persisted slots for the current range, or undefined while loading. */
    slots?: DayScheduleMap;
    /**
     * Inertia prop names to reload. The slot map must be first; hosts append
     * anything else the section needs, which is fetched on the first load only.
     */
    reloadProps: string[];
    /**
     * View to open on. Hosts that own a wider set of views (the team page adds
     * "Team") pass their current one so returning from it lands where the user
     * left off rather than snapping back to Week.
     */
    initialView?: MemberScheduleView;
};

export type MemberScheduleController = {
    view: MemberScheduleView;
    setView: (view: MemberScheduleView) => void;
    anchor: Date;
    /** The dates covered by the current view. */
    days: Date[];
    goPrev: () => void;
    goNext: () => void;
    goToday: () => void;
    /** True until the first slot map has arrived. */
    isLoading: boolean;
    slots: DayScheduleMap;
    slotsFor: (day: Date) => ScheduleSlot[];
    selectedDays: Set<string>;
    toggleDay: (key: string) => void;
    selectDays: (keys: string[]) => void;
    clearSelection: () => void;
    saveDays: (days: ScheduleDayPayload[], onDone?: () => void) => void;
    isSaving: boolean;
};

/**
 * State and persistence for the per-member week/month schedule editor.
 *
 * The slot map lives on the server as an optional Inertia prop, so changing the
 * range is a partial reload rather than a second data source to keep in sync.
 */
export function useMemberSchedule({
    memberId,
    slots,
    reloadProps,
    initialView = 'week',
}: UseMemberScheduleOptions): MemberScheduleController {
    const { t } = useTranslation('schedule');

    const [view, setViewState] =
        React.useState<MemberScheduleView>(initialView);
    const [anchor, setAnchor] = React.useState(() => new Date());
    const [selectedDays, setSelectedDays] = React.useState<Set<string>>(
        () => new Set(),
    );
    const [isSaving, setIsSaving] = React.useState(false);

    const days = React.useMemo(() => viewDays(view, anchor), [view, anchor]);

    // Saving redirects with `back()`, and an optional prop is absent from a
    // response that did not ask for it — so the map would blink away between
    // the redirect and the reload below. Holding the last one keeps the grid
    // steady; the reload overwrites it a moment later. Uses React's
    // render-phase update pattern rather than a ref, so the retained map is
    // available on the very first paint after the prop disappears.
    const [lastSlots, setLastSlots] = React.useState<DayScheduleMap | null>(
        null,
    );

    if (slots !== undefined && slots !== lastSlots) {
        setLastSlots(slots);
    }

    const resolvedSlots = React.useMemo(
        () => slots ?? lastSlots ?? EMPTY_SLOTS,
        [slots, lastSlots],
    );
    const isLoading = slots === undefined && lastSlots === null;

    const reloadRange = React.useCallback(
        (nextView: MemberScheduleView, nextAnchor: Date, props: string[]) => {
            router.reload({
                only: props,
                data: viewRange(nextView, nextAnchor),
            });
        },
        [],
    );

    // Hosts that serve the map as an optional prop (the member-edit section)
    // start with nothing, so the first range is fetched on mount. Hosts that
    // send it with the page already have it and skip straight to rendering.
    const hasLoaded = React.useRef(false);

    React.useEffect(() => {
        if (hasLoaded.current || slots !== undefined) {
            return;
        }

        hasLoaded.current = true;
        reloadRange(view, anchor, reloadProps);
        // Mount-only: later fetches are driven by the callbacks below, which
        // already know the range they are moving to.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goTo = React.useCallback(
        (nextView: MemberScheduleView, nextAnchor: Date) => {
            setViewState(nextView);
            setAnchor(nextAnchor);
            setSelectedDays(new Set());
            reloadRange(nextView, nextAnchor, [reloadProps[0]]);
        },
        [reloadRange, reloadProps],
    );

    const setView = React.useCallback(
        (nextView: MemberScheduleView) => goTo(nextView, anchor),
        [goTo, anchor],
    );

    const goPrev = React.useCallback(
        () => goTo(view, shiftAnchor(view, anchor, -1)),
        [goTo, view, anchor],
    );

    const goNext = React.useCallback(
        () => goTo(view, shiftAnchor(view, anchor, 1)),
        [goTo, view, anchor],
    );

    const goToday = React.useCallback(
        () => goTo(view, new Date()),
        [goTo, view],
    );

    const toggleDay = React.useCallback((key: string) => {
        setSelectedDays((current) => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }, []);

    const selectDays = React.useCallback(
        (keys: string[]) => setSelectedDays(new Set(keys)),
        [],
    );

    const clearSelection = React.useCallback(
        () => setSelectedDays(new Set()),
        [],
    );

    const slotsFor = React.useCallback(
        (day: Date): ScheduleSlot[] => resolvedSlots[dateKey(day)] ?? [],
        [resolvedSlots],
    );

    const saveDays = React.useCallback(
        (payload: ScheduleDayPayload[], onDone?: () => void) => {
            if (payload.length === 0) {
                return;
            }

            router.put(
                updateMemberSchedule(memberId).url,
                { days: payload },
                {
                    preserveScroll: true,
                    onStart: () => setIsSaving(true),
                    onFinish: () => {
                        setIsSaving(false);
                        reloadRange(view, anchor, [reloadProps[0]]);
                    },
                    onSuccess: () => {
                        setSelectedDays(new Set());
                        toast.success(t('toast.saved'));
                        onDone?.();
                    },
                    onError: () => toast.error(t('toast.error')),
                },
            );
        },
        [memberId, view, anchor, reloadRange, reloadProps, t],
    );

    return {
        view,
        setView,
        anchor,
        days,
        goPrev,
        goNext,
        goToday,
        isLoading,
        slots: resolvedSlots,
        slotsFor,
        selectedDays,
        toggleDay,
        selectDays,
        clearSelection,
        saveDays,
        isSaving,
    };
}

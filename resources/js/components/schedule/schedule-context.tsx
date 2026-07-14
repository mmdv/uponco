import { router, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/hooks/use-translation';
import { cellDayKey, cellMemberId } from '@/lib/schedule';
import { store as scheduleStore } from '@/routes/schedule';
import type {
    CellId,
    MonthTab,
    ScheduleMember,
    ScheduleSlot,
    ScheduleSlotMap,
} from '@/types/schedule';

type ScheduleContextValue = {
    /** Members rendered as grid rows (all members for admins, self for members). */
    members: ScheduleMember[];
    /** Whether the sticky member column is shown (admins/owners only). */
    showMemberColumn: boolean;
    monthTabs: MonthTab[];
    activeMonthKey: string;
    setActiveMonth: (key: string) => void;
    selectedCells: Set<CellId>;
    isSelected: (id: CellId) => boolean;
    toggleCell: (id: CellId) => void;
    clearSelection: () => void;
    /** Number of distinct days selected across all members. */
    selectedDayCount: number;
    /** Persisted slots for a given cell, or an empty array when none. */
    cellSlots: (id: CellId) => ScheduleSlot[];
    /** Persist `slots` for every currently selected cell. */
    saveSchedule: (slots: ScheduleSlot[]) => void;
    isSaving: boolean;
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
};

const ScheduleContext = React.createContext<ScheduleContextValue | null>(null);

export function useSchedule(): ScheduleContextValue {
    const context = React.useContext(ScheduleContext);

    if (!context) {
        throw new Error('useSchedule must be used within a ScheduleProvider.');
    }

    return context;
}

type ScheduleProviderProps = {
    members: ScheduleMember[];
    showMemberColumn: boolean;
    monthTabs: MonthTab[];
    defaultMonthKey: string;
    /** Persisted slots keyed by cell id, from the server. */
    slots: ScheduleSlotMap;
    children: React.ReactNode;
};

export function ScheduleProvider({
    members,
    showMemberColumn,
    monthTabs,
    defaultMonthKey,
    slots,
    children,
}: ScheduleProviderProps) {
    const { t } = useTranslation('schedule');
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [activeMonthKey, setActiveMonthKey] = React.useState(defaultMonthKey);
    const [selectedCells, setSelectedCells] = React.useState<Set<CellId>>(
        () => new Set(),
    );
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    // Selecting days is scoped to a single month; switching months starts fresh.
    const setActiveMonth = React.useCallback((key: string) => {
        setActiveMonthKey(key);
        setSelectedCells(new Set());
    }, []);

    const isSelected = React.useCallback(
        (id: CellId) => selectedCells.has(id),
        [selectedCells],
    );

    const toggleCell = React.useCallback((id: CellId) => {
        setSelectedCells((current) => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const clearSelection = React.useCallback(() => {
        setSelectedCells(new Set());
    }, []);

    const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);

    const cellSlots = React.useCallback(
        (id: CellId): ScheduleSlot[] => slots[id] ?? [],
        [slots],
    );

    const saveSchedule = React.useCallback(
        (nextSlots: ScheduleSlot[]) => {
            const assignments = Array.from(selectedCells, (id) => ({
                user_id: cellMemberId(id),
                date: cellDayKey(id),
            }));

            if (assignments.length === 0) {
                return;
            }

            router.post(
                scheduleStore(teamSlug).url,
                { assignments, slots: nextSlots },
                {
                    preserveScroll: true,
                    onStart: () => setIsSaving(true),
                    onFinish: () => setIsSaving(false),
                    onSuccess: () => {
                        setIsDrawerOpen(false);
                        setSelectedCells(new Set());
                        toast.success(t('toast.saved'));
                    },
                    onError: () => toast.error(t('toast.error')),
                },
            );
        },
        [selectedCells, teamSlug, t],
    );

    const selectedDayCount = React.useMemo(() => {
        const days = new Set<string>();

        for (const id of selectedCells) {
            days.add(cellDayKey(id));
        }

        return days.size;
    }, [selectedCells]);

    const value = React.useMemo<ScheduleContextValue>(
        () => ({
            members,
            showMemberColumn,
            monthTabs,
            activeMonthKey,
            setActiveMonth,
            selectedCells,
            isSelected,
            toggleCell,
            clearSelection,
            selectedDayCount,
            cellSlots,
            saveSchedule,
            isSaving,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
        }),
        [
            members,
            showMemberColumn,
            monthTabs,
            activeMonthKey,
            setActiveMonth,
            selectedCells,
            isSelected,
            toggleCell,
            clearSelection,
            selectedDayCount,
            cellSlots,
            saveSchedule,
            isSaving,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
        ],
    );

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}

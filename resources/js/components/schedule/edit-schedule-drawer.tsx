import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { CellId, ScheduleSlot } from '@/types/schedule';
import { useSchedule } from './schedule-context';
import ScheduleSlotEditor from './schedule-slot-editor';

const DEFAULT_SLOT: ScheduleSlot = { start: '09:00', end: '17:00' };

/**
 * The slots to seed the editor with when the drawer opens. When every selected
 * day shares the exact same schedule, that schedule is pre-filled so re-editing
 * a set of identical days is effortless; otherwise a single default block is
 * shown so mixed selections start from a clean slate.
 */
function initialSlotsFor(
    selectedCells: Set<CellId>,
    cellSlots: (id: CellId) => ScheduleSlot[],
): ScheduleSlot[] {
    const perCell = Array.from(selectedCells, cellSlots);
    const scheduled = perCell.filter((slots) => slots.length > 0);

    if (scheduled.length === 0 || scheduled.length !== perCell.length) {
        return [{ ...DEFAULT_SLOT }];
    }

    const first = JSON.stringify(scheduled[0]);
    const allIdentical = scheduled.every(
        (slots) => JSON.stringify(slots) === first,
    );

    return allIdentical
        ? scheduled[0].map((slot) => ({ ...slot }))
        : [{ ...DEFAULT_SLOT }];
}

/**
 * Slide-in drawer for editing the schedule of the selected days. Owns the list
 * of time blocks (pre-filled from already-scheduled days) and persists them to
 * every selected member/day on Save.
 */
export default function EditScheduleDrawer() {
    const { t } = useTranslation('schedule');
    const {
        isDrawerOpen,
        closeDrawer,
        selectedDayCount,
        selectedCells,
        cellSlots,
        saveSchedule,
        isSaving,
    } = useSchedule();
    const isMobile = useIsMobile();

    const [slots, setSlots] = useState<ScheduleSlot[]>([{ ...DEFAULT_SLOT }]);

    // Re-seed the editor for the current selection on each open, using React's
    // render-phase reset pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
    // rather than an effect so the fresh slots are ready on the first paint.
    const [wasOpen, setWasOpen] = useState(false);

    if (isDrawerOpen !== wasOpen) {
        setWasOpen(isDrawerOpen);

        if (isDrawerOpen) {
            setSlots(initialSlotsFor(selectedCells, cellSlots));
        }
    }

    const addSlot = (): void => {
        setSlots((current) => [...current, { start: '', end: '' }]);
    };

    const removeSlot = (index: number): void => {
        setSlots((current) =>
            current.filter((_, slotIndex) => slotIndex !== index),
        );
    };

    const updateSlot = (
        index: number,
        field: 'start' | 'end',
        value: string,
    ): void => {
        setSlots((current) =>
            current.map((slot, slotIndex) =>
                slotIndex === index ? { ...slot, [field]: value } : slot,
            ),
        );
    };

    return (
        <Sheet
            open={isDrawerOpen}
            onOpenChange={(open) => {
                if (!open) {
                    closeDrawer();
                }
            }}
        >
            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={cn(
                    'flex flex-col gap-0 p-0',
                    // On the bottom sheet the width comes from the built-in
                    // left/right insets, so `w-full` (which would overflow past
                    // them) is only applied to the desktop side drawer.
                    isMobile ? 'max-h-[85dvh]' : 'w-full sm:max-w-md',
                )}
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>{t('drawer.title')}</SheetTitle>
                    <SheetDescription>
                        {t('drawer.applyingTo', {
                            count: selectedDayCount,
                            dayWord: t(
                                selectedDayCount === 1
                                    ? 'daySingular'
                                    : 'dayPlural',
                            ),
                        })}
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <ScheduleSlotEditor
                        slots={slots}
                        onAdd={addSlot}
                        onRemove={removeSlot}
                        onUpdate={updateSlot}
                    />
                </div>

                <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={closeDrawer}
                        disabled={isSaving}
                    >
                        {t('drawer.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => saveSchedule(slots)}
                        disabled={isSaving || slots.length === 0}
                    >
                        {isSaving ? t('drawer.saving') : t('drawer.save')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

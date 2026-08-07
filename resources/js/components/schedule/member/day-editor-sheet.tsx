import { useState } from 'react';

import ScheduleSlotEditor from '@/components/schedule/schedule-slot-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { dateKey, parseDateKey } from '@/lib/calendar-grid';
import {
    initialSlotsForDays,
    isPastDay,
    SCHEDULE_PRESETS,
} from '@/lib/member-schedule';
import { cn } from '@/lib/utils';
import type {
    DayScheduleMap,
    ScheduleDayPayload,
    ScheduleSlot,
} from '@/types/schedule';

const dayLabelFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
});

const shortWeekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

type DayEditorSheetProps = {
    /** The day keys being edited, or null when the sheet is closed. */
    dayKeys: string[] | null;
    /** Days offered by "apply to other days" — the current week or month. */
    applicableDays: Date[];
    slots: DayScheduleMap;
    isSaving: boolean;
    onClose: () => void;
    onSave: (days: ScheduleDayPayload[]) => void;
};

/**
 * The editor for one or more days: presets, the shared time-block list, an
 * "also apply to" picker, and a day-off action that clears the day outright.
 */
export default function DayEditorSheet({
    dayKeys,
    applicableDays,
    slots,
    isSaving,
    onClose,
    onSave,
}: DayEditorSheetProps) {
    const { t } = useTranslation('schedule');
    const isMobile = useIsMobile();

    const [blocks, setBlocks] = useState<ScheduleSlot[]>([]);
    const [alsoApplyTo, setAlsoApplyTo] = useState<Set<string>>(
        () => new Set(),
    );

    // Re-seed for the current selection each time the sheet opens, using the
    // render-phase reset pattern so the values are right on the first paint.
    const [lastKeys, setLastKeys] = useState<string[] | null>(null);

    if (dayKeys !== lastKeys) {
        setLastKeys(dayKeys);

        if (dayKeys !== null) {
            setBlocks(initialSlotsForDays(dayKeys, slots));
            setAlsoApplyTo(new Set());
        }
    }

    const isOpen = dayKeys !== null;
    const editing = dayKeys ?? [];

    // Only offered when editing a single day — spreading a multi-day edit over
    // yet more days has no clear meaning.
    const otherDays =
        editing.length === 1
            ? applicableDays.filter(
                  (day) => !isPastDay(day) && !editing.includes(dateKey(day)),
              )
            : [];

    const targetKeys = [...editing, ...alsoApplyTo];

    const submit = (nextBlocks: ScheduleSlot[]): void => {
        onSave(
            targetKeys.map((date) => ({
                date,
                slots: nextBlocks.map((block) => ({ ...block })),
            })),
        );
    };

    const title =
        editing.length === 1
            ? dayLabelFormatter.format(parseDateKey(editing[0]))
            : t('member.editDays', { count: editing.length });

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                // Don't pull focus into a time input on open — it pops the
                // keyboard on mobile and starts an edit nobody asked for.
                onOpenAutoFocus={(event) => event.preventDefault()}
                className={cn(
                    'flex flex-col gap-0 p-0',
                    isMobile ? 'max-h-[85dvh]' : 'w-full sm:max-w-md',
                )}
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {targetKeys.length > 1
                            ? t('member.applyingToDays', {
                                  count: targetKeys.length,
                              })
                            : t('member.editDayDescription')}
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                    <div className="space-y-2">
                        <Label>{t('member.presets')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {SCHEDULE_PRESETS.map((preset) => (
                                <Button
                                    key={`${preset.start}-${preset.end}`}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="tabular-nums"
                                    onClick={() => setBlocks([{ ...preset }])}
                                >
                                    {preset.start}–{preset.end}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>{t('member.timeBlocks')}</Label>
                        <ScheduleSlotEditor
                            slots={blocks}
                            onAdd={() =>
                                setBlocks((current) => [
                                    ...current,
                                    { start: '', end: '' },
                                ])
                            }
                            onRemove={(index) =>
                                setBlocks((current) =>
                                    current.filter(
                                        (_, slotIndex) => slotIndex !== index,
                                    ),
                                )
                            }
                            onUpdate={(index, field, value) =>
                                setBlocks((current) =>
                                    current.map((block, slotIndex) =>
                                        slotIndex === index
                                            ? { ...block, [field]: value }
                                            : block,
                                    ),
                                )
                            }
                        />
                    </div>

                    {otherDays.length > 0 && (
                        <>
                            <Separator />

                            <div className="space-y-2">
                                <Label>{t('member.alsoApplyTo')}</Label>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {otherDays.map((day) => {
                                        const key = dateKey(day);

                                        return (
                                            <label
                                                key={key}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={alsoApplyTo.has(
                                                        key,
                                                    )}
                                                    onCheckedChange={() =>
                                                        setAlsoApplyTo(
                                                            (current) => {
                                                                const next =
                                                                    new Set(
                                                                        current,
                                                                    );

                                                                if (
                                                                    next.has(
                                                                        key,
                                                                    )
                                                                ) {
                                                                    next.delete(
                                                                        key,
                                                                    );
                                                                } else {
                                                                    next.add(
                                                                        key,
                                                                    );
                                                                }

                                                                return next;
                                                            },
                                                        )
                                                    }
                                                />
                                                {shortWeekdayFormatter.format(
                                                    day,
                                                )}{' '}
                                                {day.getDate()}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isSaving}
                        onClick={() => submit([])}
                    >
                        {t('member.markDayOff')}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            {t('drawer.cancel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => submit(blocks)}
                            disabled={isSaving || blocks.length === 0}
                        >
                            {isSaving ? t('drawer.saving') : t('drawer.save')}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

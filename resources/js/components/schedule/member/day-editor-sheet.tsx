import { Briefcase, CalendarOff, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { dateKey, parseDateKey } from '@/lib/calendar-grid';
import {
    formatHours,
    initialSlotsForDays,
    SCHEDULE_PRESETS,
    SELECTED_TOGGLE_CLASS,
    totalSlotMinutes,
} from '@/lib/member-schedule';
import { cn } from '@/lib/utils';
import type {
    DayScheduleMap,
    ScheduleDayPayload,
    ScheduleSlot,
} from '@/types/schedule';

import DayBlockRow from './day-block-row';

const dayLabelFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
});

const shortWeekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

/** Whether the day is being treated as worked or off in this edit. */
type DayMode = 'working' | 'off';

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
 * The editor for one or more days. A working/day-off switch drives the whole
 * sheet: working days expose one-tap presets and an editable list of hour
 * blocks, a day off clears them. An optional "also apply to" picker spreads the
 * choice across sibling days.
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

    const [mode, setMode] = useState<DayMode>('working');
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
            // Default to "working" so the common add-hours flow needs no extra
            // tap; the switch still lets someone mark the day off explicitly.
            setMode('working');
        }
    }

    const isOpen = dayKeys !== null;
    const editing = dayKeys ?? [];

    // Only offered when editing a single day — spreading a multi-day edit over
    // yet more days has no clear meaning.
    const otherDays =
        editing.length === 1
            ? applicableDays.filter((day) => !editing.includes(dateKey(day)))
            : [];

    const targetKeys = [...editing, ...alsoApplyTo];

    const totalMinutes = totalSlotMinutes(blocks);
    const hasValidBlocks = blocks.some((block) => block.start && block.end);
    const canSave = mode === 'off' || hasValidBlocks;

    const updateBlock = (
        index: number,
        field: 'start' | 'end',
        value: string,
    ): void => {
        setBlocks((current) =>
            current.map((block, slotIndex) =>
                slotIndex === index ? { ...block, [field]: value } : block,
            ),
        );
    };

    const removeBlock = (index: number): void => {
        setBlocks((current) =>
            current.filter((_, slotIndex) => slotIndex !== index),
        );
    };

    const addBlock = (): void => {
        setBlocks((current) => [...current, { start: '', end: '' }]);
    };

    const toggleApplyDay = (key: string): void => {
        setAlsoApplyTo((current) => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    };

    const submit = (): void => {
        const nextBlocks = mode === 'off' ? [] : blocks;

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

                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
                    {/* Working vs. day off — the switch that shapes everything
                        below, replacing the old ambiguous red text action. */}
                    <div className="space-y-2">
                        <Label>{t('member.availabilityLabel')}</Label>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={mode}
                            onValueChange={(value) => {
                                if (value) {
                                    setMode(value as DayMode);
                                }
                            }}
                            className="w-full"
                        >
                            <ToggleGroupItem
                                value="working"
                                className={cn('flex-1 gap-2', SELECTED_TOGGLE_CLASS)}
                            >
                                <Briefcase className="size-4" />
                                {t('member.working')}
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="off"
                                className={cn('flex-1 gap-2', SELECTED_TOGGLE_CLASS)}
                            >
                                <CalendarOff className="size-4" />
                                {t('member.dayOff')}
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {mode === 'off' ? (
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <CalendarOff className="size-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    {t('member.dayOffStateTitle')}
                                </p>
                                <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                                    {t('member.dayOffStateHint')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Presets — soft rounded chips, deliberately unlike
                                the bordered block rows so the two don't blur. */}
                            <div className="space-y-2">
                                <div className="space-y-0.5">
                                    <Label>{t('member.presets')}</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t('member.presetsHint')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 rounded-lg bg-muted/50 p-3">
                                    {SCHEDULE_PRESETS.map((preset) => {
                                        const active =
                                            blocks.length === 1 &&
                                            blocks[0].start === preset.start &&
                                            blocks[0].end === preset.end;

                                        return (
                                            <button
                                                key={`${preset.start}-${preset.end}`}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() =>
                                                    setBlocks([{ ...preset }])
                                                }
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm tabular-nums transition-colors',
                                                    active
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-transparent bg-background text-foreground shadow-xs hover:bg-accent',
                                                )}
                                            >
                                                <Clock className="size-3.5" />
                                                {preset.start}–{preset.end}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Separator />

                            {/* Editable blocks — each a numbered card with its own
                                running duration, so the split-shift model is
                                legible at a glance. */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <Label>{t('member.timeBlocks')}</Label>
                                        <p className="text-xs text-muted-foreground">
                                            {t('member.timeBlocksHint')}
                                        </p>
                                    </div>
                                    {totalMinutes > 0 && (
                                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary tabular-nums">
                                            {t('member.hoursTotal', {
                                                hours: formatHours(totalMinutes),
                                            })}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {blocks.map((block, index) => (
                                        <DayBlockRow
                                            key={index}
                                            index={index}
                                            block={block}
                                            onUpdate={updateBlock}
                                            onRemove={removeBlock}
                                        />
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={addBlock}
                                    >
                                        <Plus className="size-4" />
                                        {t('slotEditor.addTimeBlock')}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {otherDays.length > 0 && (
                        <>
                            <Separator />

                            <div className="space-y-2">
                                <Label>{t('member.alsoApplyTo')}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {otherDays.map((day) => {
                                        const key = dateKey(day);
                                        const selected = alsoApplyTo.has(key);

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() =>
                                                    toggleApplyDay(key)
                                                }
                                                className={cn(
                                                    'rounded-full border px-3 py-1.5 text-sm tabular-nums transition-colors',
                                                    selected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-input bg-background hover:bg-accent',
                                                )}
                                            >
                                                {shortWeekdayFormatter.format(
                                                    day,
                                                )}{' '}
                                                {day.getDate()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <SheetFooter className="shrink-0 flex-row items-center justify-end gap-2 border-t">
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
                        onClick={submit}
                        disabled={isSaving || !canSave}
                    >
                        {isSaving ? t('drawer.saving') : t('drawer.save')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

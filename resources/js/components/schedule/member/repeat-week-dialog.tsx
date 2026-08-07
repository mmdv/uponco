import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/hooks/use-translation';
import { dateKey } from '@/lib/calendar-grid';
import {
    REPEAT_WEEK_OPTIONS,
    repeatWeekPayload,
    totalSlotMinutes,
    formatHours,
} from '@/lib/member-schedule';
import type { DayScheduleMap, ScheduleDayPayload } from '@/types/schedule';

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

type RepeatWeekDialogProps = {
    open: boolean;
    /** The seven days whose pattern is being repeated. */
    weekDates: Date[];
    slots: DayScheduleMap;
    isSaving: boolean;
    onClose: () => void;
    onConfirm: (days: ScheduleDayPayload[]) => void;
};

/**
 * Copies the visible week's pattern — working days *and* days off — onto the
 * following weeks in a single request. This is the whole point of the week view
 * for anyone whose hours repeat.
 */
export default function RepeatWeekDialog({
    open,
    weekDates,
    slots,
    isSaving,
    onClose,
    onConfirm,
}: RepeatWeekDialogProps) {
    const { t } = useTranslation('schedule');
    const [weeks, setWeeks] = useState<number>(REPEAT_WEEK_OPTIONS[1]);

    const workingDays = weekDates.filter(
        (day) => (slots[dateKey(day)] ?? []).length > 0,
    );
    const totalMinutes = workingDays.reduce(
        (total, day) => total + totalSlotMinutes(slots[dateKey(day)] ?? []),
        0,
    );

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('member.repeatWeek')}</DialogTitle>
                    <DialogDescription>
                        {t('member.repeatWeekDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-3 text-sm">
                        {workingDays.length === 0 ? (
                            <span className="text-muted-foreground">
                                {t('member.repeatWeekEmpty')}
                            </span>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-1.5">
                                    {workingDays.map((day) => (
                                        <span
                                            key={dateKey(day)}
                                            className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-200"
                                        >
                                            {weekdayFormatter.format(day)}
                                        </span>
                                    ))}
                                </div>
                                <p className="pt-2 text-xs text-muted-foreground">
                                    {t('member.repeatWeekSummary', {
                                        days: workingDays.length,
                                        hours: formatHours(totalMinutes),
                                    })}
                                </p>
                            </>
                        )}
                    </div>

                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={String(weeks)}
                        onValueChange={(value) => {
                            if (value) {
                                setWeeks(Number(value));
                            }
                        }}
                        className="w-full"
                    >
                        {REPEAT_WEEK_OPTIONS.map((option) => (
                            <ToggleGroupItem
                                key={option}
                                value={String(option)}
                                className="flex-1"
                            >
                                {t('member.weekCount', { count: option })}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>

                <DialogFooter>
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
                        disabled={isSaving}
                        onClick={() =>
                            onConfirm(
                                repeatWeekPayload(weekDates, slots, weeks),
                            )
                        }
                    >
                        {isSaving
                            ? t('drawer.saving')
                            : t('member.repeatConfirm', { count: weeks })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

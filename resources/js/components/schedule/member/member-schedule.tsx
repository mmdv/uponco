import { CalendarDays, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/hooks/use-translation';
import {
    formatHours,
    isPastDay,
    totalMinutesForDays,
} from '@/lib/member-schedule';
import type {
    DayScheduleMap,
    MemberScheduleMember,
    ScheduleDayPayload,
} from '@/types/schedule';
import DayEditorSheet from './day-editor-sheet';
import MemberMonthView from './member-month-view';
import MemberWeekView from './member-week-view';
import RepeatWeekDialog from './repeat-week-dialog';
import { useMemberSchedule } from './use-member-schedule';

const weekRangeFormatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
});

const monthRangeFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
});

type MemberScheduleProps = {
    member: MemberScheduleMember;
    slots?: DayScheduleMap;
    reloadProps: string[];
    /** Other members to offer in the picker; omit to hide it. */
    members?: MemberScheduleMember[];
    onSelectMember?: (memberId: number) => void;
};

/**
 * One person's schedule as a week or a month.
 *
 * The team grid is built for stamping the same hours across many colleagues at
 * once; this is the opposite case — a single person shaping their own week,
 * with the whole range visible and no horizontal scrolling on any screen size.
 */
export default function MemberSchedule({
    member,
    slots,
    reloadProps,
    members,
    onSelectMember,
}: MemberScheduleProps) {
    const { t } = useTranslation('schedule');
    const schedule = useMemberSchedule({
        memberId: member.id,
        slots,
        reloadProps,
    });

    const [editingDays, setEditingDays] = useState<string[] | null>(null);
    const [isRepeatOpen, setIsRepeatOpen] = useState(false);

    const { view, days, selectedDays, saveDays, isSaving } = schedule;

    const rangeLabel =
        view === 'week'
            ? `${weekRangeFormatter.format(days[0])} – ${weekRangeFormatter.format(days[6])}`
            : monthRangeFormatter.format(schedule.anchor);

    // In month view the six-week grid spills into neighbouring months; the
    // total should describe the month the user is actually looking at.
    const totalDays =
        view === 'week'
            ? days
            : days.filter(
                  (day) => day.getMonth() === schedule.anchor.getMonth(),
              );
    const totalMinutes = totalMinutesForDays(schedule.slots, totalDays);

    const save = (payload: ScheduleDayPayload[]): void => {
        saveDays(payload, () => {
            setEditingDays(null);
            setIsRepeatOpen(false);
        });
    };

    return (
        <div className="space-y-4">
            {members && members.length > 1 && (
                <SearchableSelect
                    options={members.map((option) => ({
                        value: String(option.id),
                        label: option.name,
                    }))}
                    value={String(member.id)}
                    onChange={(value) => onSelectMember?.(Number(value))}
                    placeholder={t('member.selectMember')}
                    className="w-full sm:max-w-xs"
                    data-test="schedule-member-picker"
                />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('member.previous')}
                        onClick={schedule.goPrev}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={schedule.goToday}
                    >
                        {t('member.today')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t('member.next')}
                        onClick={schedule.goNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <span className="pl-2 text-sm font-medium">
                        {rangeLabel}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="tabular-nums">
                        {formatHours(totalMinutes)}
                    </Badge>

                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={view}
                        onValueChange={(value) => {
                            if (value === 'week' || value === 'month') {
                                schedule.setView(value);
                            }
                        }}
                    >
                        <ToggleGroupItem value="week">
                            {t('member.week')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="month">
                            {t('member.month')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {view === 'week' ? (
                <MemberWeekView
                    schedule={schedule}
                    onEditDay={(dayKeys) => setEditingDays(dayKeys)}
                />
            ) : (
                <MemberMonthView schedule={schedule} />
            )}

            {view === 'week' ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setIsRepeatOpen(true)}
                >
                    <Repeat className="h-4 w-4" />
                    {t('member.repeatWeek')}
                </Button>
            ) : (
                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={selectedDays.size === 0}
                    onClick={() => setEditingDays(Array.from(selectedDays))}
                >
                    <CalendarDays className="h-4 w-4" />
                    {t('member.editDays', { count: selectedDays.size })}
                </Button>
            )}

            <DayEditorSheet
                dayKeys={editingDays}
                applicableDays={days.filter(
                    (day) =>
                        !isPastDay(day) &&
                        (view === 'week' ||
                            day.getMonth() === schedule.anchor.getMonth()),
                )}
                slots={schedule.slots}
                isSaving={isSaving}
                onClose={() => setEditingDays(null)}
                onSave={save}
            />

            {view === 'week' && (
                <RepeatWeekDialog
                    open={isRepeatOpen}
                    weekDates={days}
                    slots={schedule.slots}
                    isSaving={isSaving}
                    onClose={() => setIsRepeatOpen(false)}
                    onConfirm={save}
                />
            )}
        </div>
    );
}

import { CalendarDays, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useState } from 'react';

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTranslation } from '@/hooks/use-translation';
import {
    formatHours,
    isPastDay,
    totalMinutesForDays,
} from '@/lib/member-schedule';
import type {
    DayScheduleMap,
    MemberScheduleMember,
    MemberScheduleView,
    ScheduleDayPayload,
} from '@/types/schedule';
import DayEditorSheet from './day-editor-sheet';
import MemberMonthView from './member-month-view';
import MemberWeekView from './member-week-view';
import RepeatWeekDialog from './repeat-week-dialog';
import ScheduleViewSwitcher from './schedule-view-switcher';
import type { ScheduleViewOption } from './schedule-view-switcher';
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
    /**
     * Section heading. Owned here rather than by the host page so the view
     * switcher can sit opposite it on the title row. Omit it where the host
     * already has a heading of its own — the onboarding step does.
     */
    title?: string;
    description?: string;
    /** Set false to lock the editor to `initialView`; onboarding shows week only. */
    showViewSwitcher?: boolean;
    /** Other members to offer in the picker; omit to hide it. */
    members?: MemberScheduleMember[];
    onSelectMember?: (memberId: number) => void;
    /** View to open on, for hosts that own a wider set of views. */
    initialView?: MemberScheduleView;
    /**
     * Extra switcher options beyond Week and Month — the team page appends
     * "Team". Selecting one is reported through `onSelectView`, since this
     * component cannot render it.
     */
    extraViews?: ScheduleViewOption[];
    /** Called for every switcher choice, including Week and Month. */
    onSelectView?: (value: string) => void;
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
    title,
    description,
    showViewSwitcher = true,
    members,
    onSelectMember,
    initialView,
    extraViews = [],
    onSelectView,
}: MemberScheduleProps) {
    const { t } = useTranslation('schedule');
    const schedule = useMemberSchedule({
        memberId: member.id,
        slots,
        reloadProps,
        initialView,
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

    // The button is always on screen now, so a bare "Edit 0 days" would sit
    // there whenever nothing is picked.
    const editDaysLabel =
        selectedDays.size === 0
            ? t('member.editDaysEmpty')
            : selectedDays.size === 1
              ? t('member.editDaysOne')
              : t('member.editDays', { count: selectedDays.size });

    const save = (payload: ScheduleDayPayload[]): void => {
        saveDays(payload, () => {
            setEditingDays(null);
            setIsRepeatOpen(false);
        });
    };

    return (
        <div className="space-y-4">
            {/* Title row: heading left, view switcher hard right on desktop.
                They stack on mobile, where the switcher goes full width. A host
                that supplies neither gets no row at all. */}
            {(title || showViewSwitcher) && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {title && (
                        <Heading
                            variant="small"
                            title={title}
                            description={description}
                        />
                    )}

                    {showViewSwitcher && (
                        <ScheduleViewSwitcher
                            value={view}
                            options={[
                                { value: 'week', label: t('member.week') },
                                { value: 'month', label: t('member.month') },
                                ...extraViews,
                            ]}
                            onChange={(value) => {
                                if (value === 'week' || value === 'month') {
                                    schedule.setView(value);
                                }

                                onSelectView?.(value);
                            }}
                        />
                    )}
                </div>
            )}

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

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="tabular-nums">
                        {formatHours(totalMinutes)}
                    </Badge>

                    {/* The view's primary action stays alongside the range
                        controls, always in reach rather than below a tall
                        month grid. */}
                    {view === 'week' ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRepeatOpen(true)}
                        >
                            <Repeat className="h-4 w-4" />
                            {t('member.repeatWeek')}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            disabled={selectedDays.size === 0}
                            onClick={() =>
                                setEditingDays(Array.from(selectedDays))
                            }
                        >
                            <CalendarDays className="h-4 w-4" />
                            {editDaysLabel}
                        </Button>
                    )}
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

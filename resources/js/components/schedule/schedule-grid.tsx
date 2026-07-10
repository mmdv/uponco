import * as React from 'react';

import { monthDayColumns, todayColumnIndex } from '@/lib/schedule';
import { DAY_CELL_WIDTH } from './grid-layout';
import { useSchedule } from './schedule-context';
import ScheduleGridHeader from './schedule-grid-header';
import ScheduleMemberColumn from './schedule-member-column';
import ScheduleMemberRow from './schedule-member-row';

/**
 * The scheduling grid: a fixed member column (admins only) beside a separately
 * scrollable strip of day columns — so only the days scroll horizontally, never
 * the member labels. The strip is remounted per active month so the ref-callback
 * re-anchors the scroll to today (leftmost) without an effect.
 */
export default function ScheduleGrid() {
    const { members, showMemberColumn, monthTabs, activeMonthKey } =
        useSchedule();

    const activeMonth =
        monthTabs.find((tab) => tab.key === activeMonthKey) ?? monthTabs[0];

    const columns = React.useMemo(
        () => monthDayColumns(activeMonth.year, activeMonth.month),
        [activeMonth.year, activeMonth.month],
    );

    const scrollLeftTarget = todayColumnIndex(columns) * DAY_CELL_WIDTH;

    // Ref-callback (not an effect): fires when the strip mounts. Keying the
    // container by month remounts it on month change, re-running this to anchor.
    const anchorScroll = React.useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                node.scrollLeft = scrollLeftTarget;
            }
        },
        [scrollLeftTarget],
    );

    return (
        <div className="flex overflow-hidden rounded-xl border border-border">
            {showMemberColumn && <ScheduleMemberColumn members={members} />}

            <div
                key={activeMonthKey}
                ref={anchorScroll}
                className="min-w-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] overflow-x-auto overscroll-x-none [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-track]:bg-transparent"
            >
                <div className="min-w-max">
                    <ScheduleGridHeader columns={columns} />

                    {members.map((member) => (
                        <ScheduleMemberRow
                            key={member.id}
                            member={member}
                            columns={columns}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

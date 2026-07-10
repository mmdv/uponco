import type { DayColumn, ScheduleMember } from '@/types/schedule';
import ScheduleCell from './schedule-cell';

type ScheduleMemberRowProps = {
    member: ScheduleMember;
    columns: DayColumn[];
};

/**
 * A member's row of selectable day cells inside the scrollable day area. The
 * member label lives in the separate fixed column, aligned by matching heights.
 */
export default function ScheduleMemberRow({
    member,
    columns,
}: ScheduleMemberRowProps) {
    return (
        <div className="flex">
            {columns.map((column) => (
                <ScheduleCell
                    key={column.key}
                    memberId={member.id}
                    column={column}
                />
            ))}
        </div>
    );
}

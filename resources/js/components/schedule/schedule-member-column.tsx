import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { ScheduleMember } from '@/types/schedule';
import {
    HEADER_HEIGHT_CLASS,
    MEMBER_COL_CLASS,
    ROW_HEIGHT_CLASS,
} from './grid-layout';

type ScheduleMemberColumnProps = {
    members: ScheduleMember[];
};

/**
 * The fixed left column of member labels. Sits outside the scrollable day area
 * so it never moves. On mobile the name stacks under the avatar to free up
 * horizontal room for the day columns; on desktop it sits beside the avatar.
 */
export default function ScheduleMemberColumn({
    members,
}: ScheduleMemberColumnProps) {
    const getInitials = useInitials();

    return (
        <div className="shrink-0 border-r border-border bg-background">
            <div
                className={cn(
                    MEMBER_COL_CLASS,
                    HEADER_HEIGHT_CLASS,
                    'border-b border-border',
                )}
            />

            {members.map((member) => (
                <div
                    key={member.id}
                    className={cn(
                        MEMBER_COL_CLASS,
                        ROW_HEIGHT_CLASS,
                        'flex flex-col items-center justify-center gap-0.5 border-b border-border/60 px-1.5 sm:flex-row sm:justify-start sm:gap-2 sm:px-3',
                    )}
                >
                    <Avatar className="size-6 shrink-0 sm:size-7">
                        <AvatarImage
                            src={member.avatar ?? undefined}
                            alt={member.name}
                        />
                        <AvatarFallback className="bg-neutral-200 text-[10px] text-black sm:text-xs dark:bg-neutral-700 dark:text-white">
                            {getInitials(member.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="max-w-full truncate text-[10px] font-medium sm:text-sm">
                        {member.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

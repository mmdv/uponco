import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SELECTED_TOGGLE_CLASS } from '@/lib/member-schedule';
import { cn } from '@/lib/utils';

export type ScheduleViewOption = {
    value: string;
    label: string;
};

type ScheduleViewSwitcherProps = {
    value: string;
    options: ScheduleViewOption[];
    onChange: (value: string) => void;
    className?: string;
};

/**
 * The Week / Month (/ Team) switcher.
 *
 * Shared so the personal editor and the team page present the same control —
 * the team page just adds one more option to the end.
 */
export default function ScheduleViewSwitcher({
    value,
    options,
    onChange,
    className,
}: ScheduleViewSwitcherProps) {
    return (
        <ToggleGroup
            type="single"
            variant="outline"
            value={value}
            onValueChange={(next) => {
                // Radix emits '' when the active item is re-clicked; a view
                // always has to be selected, so that is ignored.
                if (next) {
                    onChange(next);
                }
            }}
            className={cn('shrink-0 max-sm:w-full', className)}
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn('max-sm:flex-1', SELECTED_TOGGLE_CLASS)}
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

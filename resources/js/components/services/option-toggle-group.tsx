import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types';

/**
 * The selected option is tinted with the primary colour rather than the default
 * grey, which reads as barely distinct from the hover state. Mirrors the active
 * navigation item in the app header. The hover variants are repeated so hovering
 * the selected option does not fall back to grey.
 */
export const selectedOptionStyles =
    'data-[state=on]:bg-primary/10 data-[state=on]:font-medium data-[state=on]:text-primary data-[state=on]:hover:bg-primary/10 data-[state=on]:hover:text-primary dark:data-[state=on]:bg-primary/15 dark:data-[state=on]:text-primary';

/**
 * A horizontal, single-select radio group rendered as a segmented control.
 */
export function OptionToggleGroup({
    id,
    options,
    value,
    onChange,
    invalid,
    ...props
}: {
    id?: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    'data-test'?: string;
}) {
    return (
        <ToggleGroup
            type="single"
            id={id}
            value={value}
            onValueChange={(next) => {
                if (next) {
                    onChange(next);
                }
            }}
            variant="outline"
            aria-invalid={invalid}
            className="w-full"
            {...props}
        >
            {options.map((option) => (
                <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn('h-9 flex-1 px-3', selectedOptionStyles)}
                >
                    {option.label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}

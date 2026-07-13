import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type CheckboxCardOption = {
    value: string;
    label: string;
    description?: string | null;
};

type CheckboxCardGroupProps = {
    options: CheckboxCardOption[];
    value: string[];
    onChange: (value: string[]) => void;
    emptyMessage?: string;
    className?: string;
    'data-test'?: string;
};

/**
 * A mobile-friendly grid of selectable cards, each toggling a value in a
 * multi-select set. Renders richer than a dropdown when the option list is
 * short (locations, services).
 */
export function CheckboxCardGroup({
    options,
    value,
    onChange,
    emptyMessage = 'Nothing to select.',
    className,
    ...props
}: CheckboxCardGroupProps) {
    const toggle = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((item) => item !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    if (options.length === 0) {
        return (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div
            className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}
            {...props}
        >
            {options.map((option) => {
                const checked = value.includes(option.value);

                return (
                    <label
                        key={option.value}
                        data-test="checkbox-card"
                        data-state={checked ? 'checked' : 'unchecked'}
                        className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                            'hover:bg-muted/50',
                            checked && 'border-primary bg-muted/50',
                        )}
                    >
                        <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(option.value)}
                            className="mt-0.5"
                        />
                        <div className="min-w-0 space-y-0.5">
                            <div className="truncate text-sm font-medium">
                                {option.label}
                            </div>
                            {option.description ? (
                                <div className="truncate text-sm text-muted-foreground">
                                    {option.description}
                                </div>
                            ) : null}
                        </div>
                    </label>
                );
            })}
        </div>
    );
}

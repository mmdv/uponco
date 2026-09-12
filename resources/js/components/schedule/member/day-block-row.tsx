import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { formatHours, slotMinutes } from '@/lib/member-schedule';
import type { ScheduleSlot } from '@/types/schedule';

type DayBlockRowProps = {
    index: number;
    block: ScheduleSlot;
    onUpdate: (index: number, field: 'start' | 'end', value: string) => void;
    onRemove: (index: number) => void;
};

/**
 * One editable hour block in the day editor: a numbered card with a start/end
 * pair and its own running duration, so a split shift reads clearly.
 */
export default function DayBlockRow({
    index,
    block,
    onUpdate,
    onRemove,
}: DayBlockRowProps) {
    const { t } = useTranslation('schedule');
    const minutes = slotMinutes(block);

    return (
        <div className="rounded-lg border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    {t('member.blockLabel', { index: index + 1 })}
                </span>
                <div className="flex items-center gap-2">
                    {minutes > 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {formatHours(minutes)}
                        </span>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        aria-label={t('slotEditor.removeAriaLabel', {
                            index: index + 1,
                        })}
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input
                    type="time"
                    aria-label={t('slotEditor.startTimeAriaLabel', {
                        index: index + 1,
                    })}
                    value={block.start}
                    onChange={(event) =>
                        onUpdate(index, 'start', event.target.value)
                    }
                    className="flex-1 tabular-nums"
                />
                <span className="text-sm text-muted-foreground">
                    {t('slotEditor.to')}
                </span>
                <Input
                    type="time"
                    aria-label={t('slotEditor.endTimeAriaLabel', {
                        index: index + 1,
                    })}
                    value={block.end}
                    onChange={(event) =>
                        onUpdate(index, 'end', event.target.value)
                    }
                    className="flex-1 tabular-nums"
                />
            </div>
        </div>
    );
}

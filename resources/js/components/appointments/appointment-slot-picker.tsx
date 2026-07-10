import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { AppointmentSlot } from '@/types';

/** Parse a `YYYY-MM-DD` string into a local `Date`, avoiding UTC shifts. */
function parseDateInputValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
}

/** Today at local midnight, used to disable past days. */
function startOfToday(): Date {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

type Props = {
    date: string;
    onDateChange: (date: string) => void;
    slots: AppointmentSlot[];
    loading: boolean;
    selectedStart: string;
    onSelectSlot: (start: string) => void;
    /** True until a service and specialist are both chosen. */
    selectionIncomplete: boolean;
    error?: string;
};

export default function AppointmentSlotPicker({
    date,
    onDateChange,
    slots,
    loading,
    selectedStart,
    onSelectSlot,
    selectionIncomplete,
    error,
}: Props) {
    const { t } = useTranslation('appointments');
    const [open, setOpen] = useState(false);
    const selectedDate = parseDateInputValue(date);

    return (
        <div className="grid gap-2">
            <Label htmlFor="appointment-date">{t('slots.dateLabel')}</Label>
            <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                    <Button
                        id="appointment-date"
                        type="button"
                        variant="outline"
                        disabled={selectionIncomplete}
                        aria-invalid={Boolean(error)}
                        data-test="appointment-date-input"
                        className={cn(
                            'h-11 w-full justify-start rounded-xl px-4 font-normal',
                            !selectedDate && 'text-muted-foreground',
                        )}
                    >
                        <CalendarIcon className="size-4 opacity-50" />
                        {selectedDate
                            ? format(selectedDate, 'EEE, d MMM yyyy')
                            : t('slots.pickDate')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        defaultMonth={selectedDate}
                        disabled={{ before: startOfToday() }}
                        autoFocus
                        onSelect={(next) => {
                            if (next) {
                                onDateChange(format(next, 'yyyy-MM-dd'));
                            }

                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>

            <div className="mt-1">
                {selectionIncomplete ? (
                    <p className="text-sm text-muted-foreground">
                        {t('slots.selectServiceSpecialist')}
                    </p>
                ) : !date ? (
                    <p className="text-sm text-muted-foreground">
                        {t('slots.pickDateHint')}
                    </p>
                ) : loading ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-9 w-full" />
                        ))}
                    </div>
                ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('slots.noTimes')}
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                            <button
                                key={slot.start}
                                type="button"
                                disabled={!slot.available}
                                aria-pressed={selectedStart === slot.start}
                                onClick={() => onSelectSlot(slot.start)}
                                data-test="appointment-slot"
                                className={cn(
                                    'rounded-md border px-2 py-2 text-sm transition-colors',
                                    'hover:border-ring disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 disabled:hover:border-input',
                                    selectedStart === slot.start &&
                                        'border-primary bg-primary-gradient text-primary-foreground hover:border-primary',
                                )}
                            >
                                {slot.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <InputError message={error} />
        </div>
    );
}

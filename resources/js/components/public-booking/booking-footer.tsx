import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    step: number;
    canContinue: boolean;
    processing: boolean;
    onBack: () => void;
    onContinue: () => void;
    onSubmit: () => void;
    /**
     * What the primary button says on steps 0–1. When step one had nothing to
     * choose, "Continue" implies there was — this says where it actually goes.
     */
    continueLabel?: string;
    /** Pins the bar to its container instead of the viewport (embedded preview). */
    embedded?: boolean;
};

/**
 * Sticky bottom navigation: back button plus the step-aware primary action
 * (Continue on steps 0–1, Confirm booking on the final step).
 */
export default function BookingFooter({
    step,
    canContinue,
    processing,
    onBack,
    onContinue,
    onSubmit,
    continueLabel = 'Continue',
    embedded = false,
}: Props) {
    return (
        <footer
            className={cn(
                'flex w-full items-center gap-3 px-5 py-3.5',
                embedded
                    ? 'sticky bottom-0'
                    : 'fixed inset-x-0 bottom-0 mx-auto max-w-[460px]',
            )}
        >
            {step > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-[50px] shrink-0"
                    onClick={onBack}
                    aria-label="Back"
                >
                    <ArrowLeft className="size-5" />
                </Button>
            )}

            {step < 2 ? (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={!canContinue}
                    onClick={onContinue}
                    data-test="appointment-continue-button"
                >
                    {continueLabel}
                </Button>
            ) : (
                <Button
                    type="button"
                    className="h-[50px] flex-1 text-base"
                    disabled={processing}
                    onClick={onSubmit}
                    data-test="appointment-save-button"
                >
                    Confirm booking
                </Button>
            )}
        </footer>
    );
}

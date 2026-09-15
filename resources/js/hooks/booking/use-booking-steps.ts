import { useRef, useState } from 'react';

import { stepAnimationClass } from '@/lib/booking';

export type BookingSteps = {
    step: number;
    /** Slide direction for the step transition animation. */
    direction: 'forward' | 'back';
    /** The CSS class that plays the enter animation, once the visitor has moved. */
    stepClass: string;
    goToStep: (next: number) => void;
    /**
     * The furthest step reached this attempt, so an abandonment event can record
     * how deep the visitor got. A ref, not state: only analytics reads it, and it
     * must never trigger a re-render.
     */
    maxStepRef: React.RefObject<number>;
    resetSteps: () => void;
};

/**
 * Owns the wizard's step index and its enter animation. Kept free of every
 * booking concern so the navigation reads on its own.
 */
export function useBookingSteps(): BookingSteps {
    const [step, setStep] = useState(0);
    const [hasNavigated, setHasNavigated] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const maxStepRef = useRef(0);

    const goToStep = (next: number) => {
        setDirection(next > step ? 'forward' : 'back');
        setHasNavigated(true);
        setStep(next);

        if (next > maxStepRef.current) {
            maxStepRef.current = next;
        }
    };

    const resetSteps = () => {
        setDirection('back');
        setStep(0);
        maxStepRef.current = 0;
    };

    return {
        step,
        direction,
        stepClass: stepAnimationClass(hasNavigated, direction),
        goToStep,
        maxStepRef,
        resetSteps,
    };
}

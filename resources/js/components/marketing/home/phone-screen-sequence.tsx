import { useState } from 'react';
import type { CSSProperties } from 'react';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import type {
    PhoneSize,
    PhoneTilt,
} from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import type { ScreenName } from '@/components/marketing/home/screens';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

export type SequenceScreen = {
    name: ScreenName;
    /** Short step name shown under the phone, e.g. "Pick a time". */
    label: string;
    alt: string;
};

/**
 * Cycles one phone through a few real screens, the way a short screen
 * recording would. There is no timer: the active step's progress bar runs the
 * CSS `screen-progress` animation, and its `animationend` advances the step.
 * The bar is paused while the phone is off-screen, and under reduced motion
 * it doesn't animate at all, so the first screen simply stays put. The step
 * buttons let anyone move through the screens by hand.
 */
export function PhoneScreenSequence({
    screens,
    holdSeconds = 3.6,
    priority = false,
    size = 'lg',
    tilt = 'none',
    className,
    stepsLabel,
}: {
    screens: SequenceScreen[];
    holdSeconds?: number;
    /** Load the first screen eagerly — only for the hero. */
    priority?: boolean;
    size?: PhoneSize;
    tilt?: PhoneTilt;
    className?: string;
    /** Accessible name for the group of step buttons. */
    stepsLabel: string;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [ref, inView] = useInView<HTMLDivElement>();

    return (
        <div ref={ref} className={cn('flex flex-col items-center', className)}>
            <PhoneFrame size={size} tilt={tilt}>
                {screens.map((screen, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={screen.name}
                            aria-hidden={!isActive}
                            className={cn(
                                'absolute inset-0 transition-opacity duration-500',
                                isActive
                                    ? 'z-10 animate-screen-in opacity-100'
                                    : 'opacity-0',
                            )}
                        >
                            <PhoneScreen
                                name={screen.name}
                                alt={screen.alt}
                                priority={priority && index === 0}
                            />
                        </div>
                    );
                })}
            </PhoneFrame>

            <div
                role="group"
                aria-label={stepsLabel}
                className="mt-3 flex items-center gap-1"
            >
                {screens.map((screen, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <button
                            key={screen.name}
                            type="button"
                            aria-label={screen.label}
                            aria-current={isActive ? 'step' : undefined}
                            onClick={() => setActiveIndex(index)}
                            className="cursor-pointer py-3"
                        >
                            <span
                                className={cn(
                                    'relative block h-1.5 overflow-hidden rounded-full bg-foreground/15 transition-[width] duration-500',
                                    isActive ? 'w-10' : 'w-1.5',
                                )}
                            >
                                {isActive && (
                                    <span
                                        className="absolute inset-0 origin-left animate-screen-progress rounded-full bg-primary"
                                        style={
                                            {
                                                '--screen-hold': `${holdSeconds}s`,
                                                animationPlayState: inView
                                                    ? 'running'
                                                    : 'paused',
                                            } as CSSProperties
                                        }
                                        onAnimationEnd={() =>
                                            setActiveIndex(
                                                (index + 1) % screens.length,
                                            )
                                        }
                                    />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

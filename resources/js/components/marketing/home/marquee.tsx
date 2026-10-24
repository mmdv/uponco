import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * An endless horizontal ticker. The items render twice in one track that
 * slides left by half its width, so the loop is seamless; the second copy is
 * hidden from assistive tech. It pauses on hover, and under reduced motion
 * the track stops and wraps onto several lines instead.
 */
export function Marquee({
    children,
    durationSeconds = 60,
    reverse = false,
    className,
}: {
    children: ReactNode;
    durationSeconds?: number;
    reverse?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] motion-reduce:[mask-image:none]',
                className,
            )}
        >
            <div
                className="flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center"
                style={
                    {
                        '--marquee-duration': `${durationSeconds}s`,
                        animationDirection: reverse ? 'reverse' : 'normal',
                    } as CSSProperties
                }
            >
                <div className="flex shrink-0 gap-3 pr-3 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:pr-0">
                    {children}
                </div>
                <div
                    aria-hidden
                    className="flex shrink-0 gap-3 pr-3 motion-reduce:hidden"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

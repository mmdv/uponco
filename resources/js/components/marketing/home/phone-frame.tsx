import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PhoneSize = 'sm' | 'md' | 'lg';
export type PhoneTilt = 'none' | 'left' | 'right';

const sizeClasses: Record<PhoneSize, string> = {
    sm: 'w-[200px] sm:w-[230px]',
    md: 'w-[240px] sm:w-[280px]',
    lg: 'w-[264px] sm:w-[330px] lg:w-[380px]',
};

const tiltStyles: Record<PhoneTilt, CSSProperties | undefined> = {
    none: undefined,
    left: { transform: 'perspective(1800px) rotateY(14deg) rotateX(4deg)' },
    right: { transform: 'perspective(1800px) rotateY(-14deg) rotateX(4deg)' },
};

/** The iOS status bar glyphs: signal, Wi-Fi and battery. */
function StatusIcons() {
    return (
        <svg
            viewBox="0 0 68 12"
            className="h-[3cqw] w-auto"
            fill="currentColor"
            aria-hidden
        >
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="4.5" y="6" width="3" height="6" rx="1" />
            <rect x="9" y="3.5" width="3" height="8.5" rx="1" />
            <rect x="13.5" y="1" width="3" height="11" rx="1" />
            <path d="M30 2.6a10 10 0 0 1 7 2.8l1.2-1.2A11.7 11.7 0 0 0 30 1a11.7 11.7 0 0 0-8.2 3.2L23 5.4a10 10 0 0 1 7-2.8Zm0 3.4a6.6 6.6 0 0 1 4.6 1.9l1.2-1.2A8.3 8.3 0 0 0 30 4.4a8.3 8.3 0 0 0-5.8 2.3l1.2 1.2A6.6 6.6 0 0 1 30 6Zm0 3.4c.9 0 1.7.3 2.3.9L30 12.6l-2.3-2.3c.6-.6 1.4-.9 2.3-.9Z" />
            <rect
                x="44"
                y="1"
                width="20"
                height="10"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.4"
            />
            <rect x="46" y="3" width="16" height="6" rx="1.6" />
            <path d="M65.5 4.2v3.6a1.9 1.9 0 0 0 0-3.6Z" opacity="0.4" />
        </svg>
    );
}

/**
 * A modern iPhone drawn in CSS: titanium edge, black bezel, Dynamic Island,
 * side buttons, status bar and home indicator, all sized in container query
 * units so it stays crisp at any width. `children` fill the screen between the
 * status bar and the bottom safe area (47pt and 34pt on a 390x844pt iPhone) —
 * a {@link PhoneScreen} capture or a {@link PhoneScreenSequence}.
 */
export function PhoneFrame({
    size = 'md',
    tilt = 'none',
    className,
    screenClassName,
    children,
}: {
    size?: PhoneSize;
    tilt?: PhoneTilt;
    className?: string;
    /** Background behind the status bar, matched to the captured page. */
    screenClassName?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn('relative shrink-0', sizeClasses[size], className)}
            style={tiltStyles[tilt]}
        >
            {/* Side buttons sit just outside the body: action + volume on the
                left, power on the right. */}
            <span
                aria-hidden
                className="absolute top-[17%] -left-[0.9%] h-[4%] w-[1.4%] rounded-l-sm bg-gradient-to-r from-zinc-500 to-zinc-300 dark:from-zinc-700 dark:to-zinc-500"
            />
            <span
                aria-hidden
                className="absolute top-[25%] -left-[0.9%] h-[7.5%] w-[1.4%] rounded-l-sm bg-gradient-to-r from-zinc-500 to-zinc-300 dark:from-zinc-700 dark:to-zinc-500"
            />
            <span
                aria-hidden
                className="absolute top-[34%] -left-[0.9%] h-[7.5%] w-[1.4%] rounded-l-sm bg-gradient-to-r from-zinc-500 to-zinc-300 dark:from-zinc-700 dark:to-zinc-500"
            />
            <span
                aria-hidden
                className="absolute top-[28%] -right-[0.9%] h-[11%] w-[1.4%] rounded-r-sm bg-gradient-to-l from-zinc-500 to-zinc-300 dark:from-zinc-700 dark:to-zinc-500"
            />

            {/* Titanium body with a layered drop shadow. */}
            <div className="@container rounded-[15%/7%] bg-[linear-gradient(145deg,#e4e6ea,#a4a9b1_35%,#eceef1_55%,#8f949c)] p-[1.1%] shadow-[0_2px_4px_rgba(15,23,42,0.08),0_30px_60px_-20px_rgba(15,23,42,0.35),0_60px_120px_-40px_rgba(15,23,42,0.35)] dark:bg-[linear-gradient(145deg,#4b4f57,#25282d_35%,#55595f_55%,#1c1e22)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
                {/* Black bezel. */}
                <div className="rounded-[14%/6.5%] bg-black p-[3.2cqw]">
                    {/* Screen. */}
                    <div
                        className={cn(
                            'relative flex aspect-[390/844] flex-col overflow-hidden rounded-[11.5cqw] bg-[#fcfcfc] text-[#111]',
                            screenClassName,
                        )}
                    >
                        <div className="relative flex h-[11cqw] shrink-0 items-center justify-between px-[8cqw] pt-[1cqw] text-[3.8cqw] font-semibold">
                            <span>9:41</span>
                            <StatusIcons />
                            <span
                                aria-hidden
                                className="absolute top-[2.6cqw] left-1/2 h-[9cqw] w-[31cqw] -translate-x-1/2 rounded-full bg-black"
                            />
                        </div>
                        <div className="relative min-h-0 flex-1">
                            {children}
                        </div>
                        {/* Home-indicator safe area: the page ends above it,
                            as it does on a real iPhone. */}
                        <div
                            aria-hidden
                            className="h-[7.9cqw] shrink-0 bg-white"
                        />
                        <span
                            aria-hidden
                            className="absolute bottom-[2cqw] left-1/2 h-[1.3cqw] w-[34cqw] -translate-x-1/2 rounded-full bg-black/85"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

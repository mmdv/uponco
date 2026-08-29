import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    /** Layout classes for the wrapper itself (display, min-height, padding). */
    className?: string;
};

/**
 * Which backdrop the whole app wears. Swap this one value to change every
 * surface at once:
 *
 * - `none`  — no blooms at all; the page rests on the flat `--app-base` colour.
 * - `bloom` — still. A single wide bloom of brand blue resting in the bottom
 *   right, with a faint counterweight top left.
 * - `drift` — the same two blooms, breathing slowly in and out of the corners
 *   over roughly a minute.
 * - `mesh`  — three small blooms spread across the page, fading gently in and
 *   out together.
 */
const VARIANT: 'none' | 'bloom' | 'drift' | 'mesh' = 'none';

/**
 * The single place the app's page backdrop is defined. Every major surface —
 * landing page, onboarding and everything under the app header — renders
 * through this, so swapping the blooms for a flat colour, an image or a
 * different artwork later is a change to this one component.
 *
 * The layers are pinned to the viewport rather than stretched over the
 * document, so a long page keeps the same backdrop from top to bottom instead
 * of thinning the colour out over its whole height. Wrap the outermost element
 * of a surface — including its header — so nothing paints over it.
 *
 * Phones get none of it: below `md` the layers are not rendered at all and the
 * page falls back to the plain background, so a small screen stays as calm as
 * the content on it.
 */
export default function AppBackground({ children, className }: Props) {
    return (
        <div
            className={cn(
                'relative isolate bg-background md:bg-app-base',
                className,
            )}
        >
            {VARIANT !== 'none' && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block"
                >
                    {VARIANT === 'bloom' && <BloomLayers />}
                    {VARIANT === 'drift' && <DriftLayers />}
                    {VARIANT === 'mesh' && <MeshLayers />}
                </div>
            )}

            {children}
        </div>
    );
}

/** Still: one bloom low right, one much fainter high left. */
function BloomLayers() {
    return (
        <>
            <div className="absolute -right-[15vw] -bottom-[25vw] size-[75vw] min-h-[30rem] min-w-[30rem] rounded-full bg-app-bloom blur-3xl" />
            <div className="absolute -top-[30vw] -left-[20vw] size-[65vw] min-h-[26rem] min-w-[26rem] rounded-full bg-app-bloom-faint blur-3xl" />
        </>
    );
}

/**
 * The same two blooms, drifting. The motion is slow enough to read as light
 * changing rather than as animation, and stops outright for anyone who has
 * asked for reduced motion.
 */
function DriftLayers() {
    return (
        <>
            <div className="absolute -right-[15vw] -bottom-[25vw] size-[75vw] min-h-[30rem] min-w-[30rem] animate-app-drift-a rounded-full bg-app-bloom blur-3xl will-change-transform motion-reduce:animate-none" />
            <div className="absolute -top-[30vw] -left-[20vw] size-[65vw] min-h-[26rem] min-w-[26rem] animate-app-drift-b rounded-full bg-app-bloom-soft blur-3xl will-change-transform motion-reduce:animate-none" />
        </>
    );
}

/** Three smaller blooms spread over the page, fading in and out together. */
function MeshLayers() {
    return (
        <div className="absolute inset-0 animate-app-breathe motion-reduce:animate-none">
            <div className="absolute -top-[18vw] -left-[10vw] size-[50vw] min-h-[22rem] min-w-[22rem] rounded-full bg-app-bloom-soft blur-3xl" />
            <div className="absolute top-[25%] -right-[12vw] size-[45vw] min-h-[20rem] min-w-[20rem] rounded-full bg-app-bloom blur-3xl" />
            <div className="absolute -bottom-[20vw] left-[15%] size-[55vw] min-h-[24rem] min-w-[24rem] rounded-full bg-app-bloom-faint blur-3xl" />
        </div>
    );
}

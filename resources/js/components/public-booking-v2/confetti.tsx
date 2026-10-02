import type { CSSProperties } from 'react';

/** How many pieces fly out, and the palette they cycle through. */
const PIECE_COUNT = 28;
const COLOURS = [
    'var(--color-primary)',
    'color-mix(in oklab, var(--color-primary) 55%, white)',
    '#f59e0b',
    '#10b981',
    '#ec4899',
    '#8b5cf6',
];

type Piece = {
    style: CSSProperties;
    round: boolean;
};

/**
 * A deterministic burst: pieces are spread evenly around the circle with a
 * little golden-angle jitter, so the pattern looks random but renders the same
 * on the server and client (and needs no `Math.random` during render).
 */
const PIECES: Piece[] = Array.from({ length: PIECE_COUNT }, (_, index) => {
    const angle = (index / PIECE_COUNT) * Math.PI * 2 + (index % 3) * 0.21;
    const distance = 70 + ((index * 137.5) % 70);

    return {
        round: index % 3 === 0,
        style: {
            '--confetti-x': `${Math.round(Math.cos(angle) * distance)}px`,
            // Pieces drift down as they fly, as if falling.
            '--confetti-y': `${Math.round(Math.sin(angle) * distance + 40)}px`,
            '--confetti-spin': `${(index % 2 === 0 ? 1 : -1) * (180 + index * 23)}deg`,
            backgroundColor: COLOURS[index % COLOURS.length],
            animationDelay: `${300 + (index % 5) * 40}ms`,
        } as CSSProperties,
    };
});

/**
 * A one-shot confetti burst from the centre of its (relatively positioned)
 * parent. Pure CSS; hidden entirely for visitors who asked for reduced motion.
 */
export default function Confetti() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center motion-reduce:hidden"
        >
            {PIECES.map((piece, index) => (
                <span
                    key={index}
                    style={piece.style}
                    className={
                        piece.round
                            ? 'absolute size-2 animate-confetti rounded-full'
                            : 'absolute h-2.5 w-1.5 animate-confetti rounded-[2px]'
                    }
                />
            ))}
        </div>
    );
}

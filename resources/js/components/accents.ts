/**
 * Card accents. Every surface is a shade of the brand blue rather than its own
 * hue, so the app reads as one colour with depth. Cards are told apart by their
 * illustration and their weight on the scale, not by competing colours.
 *
 * Class strings are kept literal (not interpolated) so Tailwind can detect and
 * compile them.
 */
export type Accent = 'ink' | 'deep' | 'brand' | 'bright' | 'soft';

export type AccentStyles = {
    /** Gradient used for filled icon tiles and chart bars. */
    gradient: string;
    /** Coloured drop shadow that lifts a filled icon tile off the card. */
    shadow: string;
    /** Soft tinted surface used for card backgrounds and hovers. */
    soft: string;
    /**
     * Foreground colour for accented text. Held at the readable end of the
     * scale on the lighter shades, so a label never washes out against a tint.
     */
    text: string;
    /**
     * Border colour picked up when the card itself is hovered. Applied to the
     * card element, so this is a plain `hover:` variant rather than
     * `group-hover:` — the latter only matches descendants of the group.
     */
    ring: string;
    /** Ambient corner wash painted under a card's content. */
    wash: string;
    /** Colour a decorative SVG inherits through `currentColor`. */
    graphic: string;
};

export const ACCENTS: Record<Accent, AccentStyles> = {
    ink: {
        gradient: 'from-[#00307f] to-[#0052d6]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,48,127,0.75)]',
        soft: 'bg-[#00307f]/10',
        text: 'text-[#00307f] dark:text-[#8fbaff]',
        ring: 'hover:border-[#00307f]/40',
        wash: 'from-[#00307f]/[0.08] dark:from-[#3884fe]/[0.09]',
        graphic: 'text-[#00307f] dark:text-[#6aa6ff]',
    },
    deep: {
        gradient: 'from-[#0047b8] to-[#0063ff]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,71,184,0.75)]',
        soft: 'bg-[#0047b8]/10',
        text: 'text-[#0047b8] dark:text-[#8fbaff]',
        ring: 'hover:border-[#0047b8]/40',
        wash: 'from-[#0047b8]/[0.09] dark:from-[#3884fe]/[0.1]',
        graphic: 'text-[#0047b8] dark:text-[#6aa6ff]',
    },
    brand: {
        gradient: 'from-[#0063ff] to-[#3884fe]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(0,99,255,0.75)]',
        soft: 'bg-[#0063ff]/10',
        text: 'text-[#0063ff] dark:text-[#8fbaff]',
        ring: 'hover:border-[#0063ff]/40',
        wash: 'from-[#0063ff]/[0.09] dark:from-[#3884fe]/[0.11]',
        graphic: 'text-[#0063ff] dark:text-[#5b9bff]',
    },
    bright: {
        gradient: 'from-[#2a7bff] to-[#6aa6ff]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(42,123,255,0.75)]',
        soft: 'bg-[#2a7bff]/10',
        text: 'text-[#0063ff] dark:text-[#a5c8ff]',
        ring: 'hover:border-[#2a7bff]/45',
        wash: 'from-[#2a7bff]/[0.1] dark:from-[#3884fe]/[0.12]',
        graphic: 'text-[#2a7bff] dark:text-[#6aa6ff]',
    },
    soft: {
        gradient: 'from-[#4d8dff] to-[#8fbaff]',
        shadow: 'shadow-[0_8px_18px_-8px_rgba(77,141,255,0.75)]',
        soft: 'bg-[#4d8dff]/10',
        text: 'text-[#0063ff] dark:text-[#a5c8ff]',
        ring: 'hover:border-[#4d8dff]/50',
        wash: 'from-[#4d8dff]/[0.11] dark:from-[#3884fe]/[0.13]',
        graphic: 'text-[#4d8dff] dark:text-[#8fbaff]',
    },
};

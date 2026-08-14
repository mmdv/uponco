import type { CSSProperties } from 'react';

/**
 * A team's customer-facing colours, as served by `App\Support\BrandPalette`.
 * Only the primary is stored; the accent is always the primary at 10% opacity.
 */
export type BrandPalette = {
    primary: string;
    accent: string;
};

/**
 * The accent for a `#rrggbb` primary: the same 10% wash `BrandPalette::accent()`
 * derives on the server, so the settings preview matches what gets saved.
 */
export function accentFrom(primary: string): string {
    const hex = /^#([0-9a-fA-F]{6})$/.exec(primary.trim());

    if (!hex) {
        return 'rgba(0, 99, 255, 0.1)';
    }

    const [red, green, blue] = [0, 2, 4].map((offset) =>
        parseInt(hex[1].slice(offset, offset + 2), 16),
    );

    return `rgba(${red}, ${green}, ${blue}, 0.1)`;
}

/**
 * The CSS custom properties that repaint a public surface in a team's colours,
 * so every `bg-primary` / `text-primary` / `border-primary` inside follows the
 * brand without a per-component change. `--brand-accent` is the 10% wash;
 * being translucent it works over both the light and the dark theme.
 *
 * The `--color-*` twins are not redundant: `@theme` declares them on `:root`
 * as `var(--primary)`, which resolves there and inherits down as an already
 * computed colour, so overriding only `--primary` deeper in the tree never
 * reaches the utilities.
 */
export function brandStyle(brand?: BrandPalette | null): CSSProperties {
    if (!brand) {
        return {};
    }

    return {
        '--primary': brand.primary,
        '--color-primary': brand.primary,
        // The default button variant paints `--primary-gradient` over its
        // background colour, so the brand has to reach the gradient too or
        // every CTA stays platform blue. The lighter stop mirrors how the
        // platform pair lifts towards the top right.
        '--primary-gradient': `linear-gradient(to top right, ${brand.primary}, color-mix(in oklab, ${brand.primary} 78%, white))`,
        '--ring': brand.primary,
        '--color-ring': brand.primary,
        '--sidebar-primary': brand.primary,
        '--color-sidebar-primary': brand.primary,
        '--brand-accent': brand.accent,
        '--color-brand-accent': brand.accent,
    } as CSSProperties;
}

import { FeaturePillars } from 'uponco';

/**
 * A prop-less landing-page section that renders the marketing copy it ships
 * with. It is far taller and wider than a default cell, so the card is pinned
 * to `cardMode: single` at 1280x2200 in .design-sync/config.json — that also
 * puts the viewport past `lg:`, which is where the two-column pillar layout
 * lives. No scaling wrapper: it renders at its real size.
 */
export function MarketingSection() {
    return <FeaturePillars />;
}

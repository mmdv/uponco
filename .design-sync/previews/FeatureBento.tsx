import { FeatureBento } from 'uponco';

/**
 * The prop-less marketing bento section, rendered at its real size. The cell
 * viewport is 900x700 so only the heading and the first row of tiles fit —
 * `.design-sync/config.json` would need
 * `"FeatureBento": {"cardMode": "single", "viewport": "1280x2000"}`
 * to show the whole grid, which this pass could not add.
 */
export function TopOfTheSection() {
    return <FeatureBento />;
}

/**
 * The whole grid, scaled down to fit the cell — use this one to judge the
 * bento's overall composition rather than its copy.
 */
export function WholeGridScaled() {
    return (
        <div style={{ width: 900, height: 700, overflow: 'hidden' }}>
            <div
                style={{
                    width: 1280,
                    transform: 'scale(0.44)',
                    transformOrigin: 'top left',
                }}
            >
                <FeatureBento />
            </div>
        </div>
    );
}

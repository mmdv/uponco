/**
 * Every real Uponco screen captured for the home page phones by
 * scripts/marketing/capture-home-screens.mjs. Each one ships as
 * /images/home/{name}.avif and .webp at the same size.
 */
export const SCREEN_WIDTH = 780;
export const SCREEN_HEIGHT = 1526;

export type ScreenName =
    | 'booking-choose'
    | 'booking-time'
    | 'booking-confirmed'
    | 'booking-specialist'
    | 'brand-studio-north'
    | 'brand-lumen-yoga'
    | 'brand-harbor-physio'
    | 'brand-mira-tutoring'
    | 'yoga-time'
    | 'yoga-services'
    | 'physio-locations'
    | 'team-calendar'
    | 'working-hours'
    | 'team-members'
    | 'google-integration';

export function screenSource(
    name: ScreenName,
    format: 'avif' | 'webp',
): string {
    return `/images/home/${name}.${format}`;
}

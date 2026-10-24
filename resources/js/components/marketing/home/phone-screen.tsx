import {
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    screenSource,
} from '@/components/marketing/home/screens';
import type { ScreenName } from '@/components/marketing/home/screens';
import { cn } from '@/lib/utils';

/**
 * One captured Uponco screen inside a {@link PhoneFrame}. AVIF first with a
 * WebP fallback; lazy unless `priority`, which is reserved for the hero's
 * first screen (the page's LCP image).
 */
export function PhoneScreen({
    name,
    alt,
    priority = false,
    className,
}: {
    name: ScreenName;
    alt: string;
    priority?: boolean;
    className?: string;
}) {
    return (
        <picture>
            <source type="image/avif" srcSet={screenSource(name, 'avif')} />
            <img
                src={screenSource(name, 'webp')}
                alt={alt}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding={priority ? 'sync' : 'async'}
                draggable={false}
                className={cn(
                    'absolute inset-0 size-full object-cover object-top select-none',
                    className,
                )}
            />
        </picture>
    );
}

import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
    /** Optional image URL — drop real photos in later. */
    src?: string | null;
    alt?: string;
    className?: string;
};

/**
 * A neutral image placeholder used across the booking flow until real salon
 * photography is supplied. Renders the image when a `src` is provided.
 */
export default function PhotoPlaceholder({ src, alt = '', className }: Props) {
    return (
        <div
            className={cn(
                'flex items-center justify-center overflow-hidden bg-muted text-muted-foreground/40',
                className,
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="size-full object-cover"
                    loading="lazy"
                />
            ) : (
                <ImageIcon className="size-5" />
            )}
        </div>
    );
}

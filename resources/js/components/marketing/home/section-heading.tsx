import { Reveal } from '@/components/marketing/home/reveal';
import { cn } from '@/lib/utils';

/**
 * The big, tight headline plus calm subline every home section opens with.
 */
export function SectionHeading({
    title,
    subtitle,
    align = 'center',
    className,
    titleClassName,
}: {
    title: string;
    subtitle?: string;
    align?: 'center' | 'left';
    className?: string;
    titleClassName?: string;
}) {
    return (
        <Reveal
            className={cn(
                align === 'center'
                    ? 'mx-auto max-w-3xl text-center'
                    : 'max-w-xl',
                className,
            )}
        >
            <h2
                className={cn(
                    'text-[clamp(2.125rem,4.4vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-foreground',
                    titleClassName,
                )}
            >
                {title}
            </h2>
            {subtitle && (
                <p className="mt-5 text-lg leading-relaxed text-balance text-muted-foreground sm:text-xl">
                    {subtitle}
                </p>
            )}
        </Reveal>
    );
}

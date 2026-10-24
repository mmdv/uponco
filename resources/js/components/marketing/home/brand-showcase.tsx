import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';
import type { ScreenName } from '@/components/marketing/home/screens';
import { SectionHeading } from '@/components/marketing/home/section-heading';
import { cn } from '@/lib/utils';

export type BrandPhone = {
    screen: ScreenName;
    alt: string;
    /** The business type, shown as a caption under the phone. */
    caption: string;
};

/** Gentle, alternating lift so the row reads as a wall, not a grid. */
const offsets = [
    'lg:translate-y-10',
    'lg:-translate-y-2',
    'lg:translate-y-6',
    'lg:-translate-y-4',
];

/**
 * "Your booking page. Your brand." A row of phones, each the same booking page
 * dressed in a different fictional business's logo and colour. Scrolls
 * sideways with snap on small screens; sits in one staggered row on desktop.
 */
export function BrandShowcase({
    title,
    subtitle,
    phones,
}: {
    title: string;
    subtitle: string;
    phones: BrandPhone[];
}) {
    return (
        <section className="py-20 sm:py-32">
            <div className="px-4">
                <SectionHeading title={title} subtitle={subtitle} />
            </div>

            <div className="mt-14 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto px-[max(1rem,calc(50vw-6.5rem))] pb-14 sm:gap-8 lg:justify-center lg:overflow-visible lg:px-4 lg:pb-10">
                {phones.map((phone, index) => (
                    <Reveal
                        key={phone.screen}
                        delay={index * 0.08}
                        className={cn(
                            'flex shrink-0 snap-center flex-col items-center',
                            offsets[index % offsets.length],
                        )}
                    >
                        <PhoneFrame size="sm">
                            <PhoneScreen name={phone.screen} alt={phone.alt} />
                        </PhoneFrame>
                        <p className="mt-5 text-sm font-medium text-muted-foreground">
                            {phone.caption}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

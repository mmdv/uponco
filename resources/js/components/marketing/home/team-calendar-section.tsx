import { BellRing, CalendarClock, CalendarX2, Check } from 'lucide-react';
import { FloatingCard } from '@/components/marketing/home/floating-card';
import { PhoneFrame } from '@/components/marketing/home/phone-frame';
import { PhoneScreen } from '@/components/marketing/home/phone-screen';
import { Reveal } from '@/components/marketing/home/reveal';
import { SectionHeading } from '@/components/marketing/home/section-heading';

type Notice = { eyebrow: string; title: string; meta: string };

/**
 * "One calendar for the whole team": the business side. A large rounded panel
 * with the copy on the left and the real day view on the right, with the three
 * phone alerts a specialist gets — booked, moved, cancelled — stacked beside it.
 */
export function TeamCalendarSection({
    title,
    body,
    points,
    alt,
    notices,
}: {
    title: string;
    body: string;
    points: string[];
    alt: string;
    notices: { booked: Notice; moved: Notice; cancelled: Notice };
}) {
    return (
        <section className="px-4 py-12 sm:py-20">
            <div className="mx-auto grid max-w-6xl items-center gap-12 overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,var(--secondary),color-mix(in_oklab,var(--primary)_12%,var(--secondary)))] px-6 pt-12 sm:px-12 lg:grid-cols-[1fr_1.05fr] lg:gap-6 lg:px-16 lg:pt-0">
                <div className="lg:py-20">
                    <SectionHeading
                        title={title}
                        subtitle={body}
                        align="left"
                    />
                    <Reveal delay={0.1}>
                        <ul className="mt-8 flex flex-col gap-3">
                            {points.map((point) => (
                                <li
                                    key={point}
                                    className="flex gap-3 text-base text-foreground sm:text-lg"
                                >
                                    <Check className="mt-1 size-5 shrink-0 text-primary" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>

                <div className="relative mx-auto -mb-24 w-fit lg:mt-16 lg:-mb-32">
                    <PhoneFrame size="lg">
                        <PhoneScreen name="team-calendar" alt={alt} />
                    </PhoneFrame>
                    <FloatingCard
                        icon={<BellRing />}
                        eyebrow={notices.booked.eyebrow}
                        title={notices.booked.title}
                        meta={notices.booked.meta}
                        className="top-[8%] -right-4 sm:-right-24"
                    />
                    <FloatingCard
                        icon={<CalendarClock />}
                        eyebrow={notices.moved.eyebrow}
                        title={notices.moved.title}
                        meta={notices.moved.meta}
                        className="top-[30%] -right-2 sm:-right-12"
                        delay={1.2}
                    />
                    <FloatingCard
                        icon={<CalendarX2 />}
                        eyebrow={notices.cancelled.eyebrow}
                        title={notices.cancelled.title}
                        meta={notices.cancelled.meta}
                        className="top-[52%] -right-4 sm:-right-28"
                        delay={2.4}
                    />
                </div>
            </div>
        </section>
    );
}

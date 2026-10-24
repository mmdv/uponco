import { Marquee } from '@/components/marketing/home/marquee';
import { SectionHeading } from '@/components/marketing/home/section-heading';

export type Testimonial = {
    quote: string;
    name: string;
    /** The business they run, e.g. "Barbershop owner". */
    role: string;
};

/**
 * An auto-scrolling row of glass review cards. Renders nothing until there
 * are real reviews — never ship placeholder quotes.
 */
export function TestimonialsSection({
    title,
    testimonials,
}: {
    title: string;
    testimonials: Testimonial[];
}) {
    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-20 sm:py-32">
            <div className="px-4">
                <SectionHeading title={title} />
            </div>
            <Marquee durationSeconds={90} className="mt-14">
                {testimonials.map((testimonial) => (
                    <figure
                        key={testimonial.name}
                        className="w-80 shrink-0 rounded-3xl glass p-6"
                    >
                        <blockquote className="text-base leading-relaxed text-foreground">
                            “{testimonial.quote}”
                        </blockquote>
                        <figcaption className="mt-4 text-sm">
                            <span className="font-semibold text-foreground">
                                {testimonial.name}
                            </span>{' '}
                            <span className="text-muted-foreground">
                                · {testimonial.role}
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </Marquee>
        </section>
    );
}

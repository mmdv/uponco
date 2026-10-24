import {
    Baby,
    Brain,
    Camera,
    Car,
    Dog,
    Dumbbell,
    Flower2,
    GraduationCap,
    Hand,
    HeartPulse,
    Languages,
    Music,
    PawPrint,
    Scissors,
    Smile,
    Sparkles,
    SprayCan,
    Stethoscope,
    Briefcase,
    Eye,
    Waves,
    UserRound,
    Bath,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Marquee } from '@/components/marketing/home/marquee';

/** One icon per business category key the page passes in. */
const categoryIcons: Record<string, LucideIcon> = {
    hairdressers: Scissors,
    barbershops: Scissors,
    nailSalons: Hand,
    lashesBrows: Eye,
    massage: Waves,
    spas: Bath,
    yoga: Flower2,
    pilates: HeartPulse,
    personalTrainers: Dumbbell,
    dentalClinics: Smile,
    physiotherapy: Stethoscope,
    psychologists: Brain,
    lifeCoaches: UserRound,
    vets: PawPrint,
    petGrooming: Dog,
    tutors: GraduationCap,
    languageSchools: Languages,
    musicLessons: Music,
    drivingSchools: Car,
    photographers: Camera,
    consultants: Briefcase,
    carDetailing: SprayCan,
    cleaning: Sparkles,
    kidsActivities: Baby,
};

export type CategoryItem = { key: string; label: string };

function Chip({ item }: { item: CategoryItem }) {
    const Icon = categoryIcons[item.key] ?? Sparkles;

    return (
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground sm:text-base">
            <Icon className="size-4 text-primary" aria-hidden />
            {item.label}
        </span>
    );
}

/**
 * "Made for anyone who works by appointment": two rows of business types
 * drifting in opposite directions, then the integrations we really have.
 */
export function CategoriesMarquee({
    heading,
    rows,
    worksWithLabel,
    worksWith,
}: {
    heading: string;
    rows: [CategoryItem[], CategoryItem[]];
    worksWithLabel: string;
    worksWith: string[];
}) {
    return (
        <section className="py-16 sm:py-24">
            <h2 className="px-4 text-center text-base font-semibold text-foreground sm:text-lg">
                {heading}
            </h2>
            <div className="mt-8 flex flex-col gap-3">
                <Marquee durationSeconds={70}>
                    {rows[0].map((item) => (
                        <Chip key={item.key} item={item} />
                    ))}
                </Marquee>
                <Marquee durationSeconds={80} reverse>
                    {rows[1].map((item) => (
                        <Chip key={item.key} item={item} />
                    ))}
                </Marquee>
            </div>
            <p className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-sm text-muted-foreground">
                <span>{worksWithLabel}</span>
                {worksWith.map((name, index) => (
                    <span key={name} className="inline-flex items-center gap-3">
                        {index > 0 && <span aria-hidden>·</span>}
                        <span className="font-semibold text-foreground">
                            {name}
                        </span>
                    </span>
                ))}
            </p>
        </section>
    );
}

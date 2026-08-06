import {
    Accessibility,
    Bath,
    Bone,
    BookOpen,
    Brain,
    BriefcaseBusiness,
    Brush,
    Calculator,
    Camera,
    Car,
    CarFront,
    ConciergeBell,
    Dog,
    Drama,
    Droplets,
    Dumbbell,
    Eye,
    Flower,
    Flower2,
    Gavel,
    Gem,
    Glasses,
    Hammer,
    Hand,
    HandHeart,
    House,
    Languages,
    Laptop,
    Leaf,
    MessagesSquare,
    Music,
    Palette,
    PartyPopper,
    PawPrint,
    PenTool,
    PersonStanding,
    Salad,
    ScanFace,
    Scissors,
    Smile,
    Sofa,
    Sparkles,
    Speech,
    SprayCan,
    Stethoscope,
    Target,
    Trophy,
    Wrench,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * The icon shown when a business has no category, picked "Other", or was given
 * a category this map has not caught up with yet.
 */
export const GENERIC_SERVICE_ICON: LucideIcon = ConciergeBell;

/**
 * An icon per business category, keyed by the value of the backend's
 * `App\Enums\BusinessCategory`. A category without an entry falls back to the
 * generic one rather than breaking the page, so adding a case to the enum is
 * never a hard dependency on touching this file.
 */
const BUSINESS_CATEGORY_ICONS: Record<string, LucideIcon> = {
    hairdresser: Scissors,
    barbershop: SprayCan,

    beauty_salon: Sparkles,
    nail_salon: Hand,
    lashes_brows: Eye,
    makeup_artist: Brush,
    skin_care_clinic: ScanFace,
    hair_removal: Zap,
    tattoo_studio: PenTool,
    piercing_studio: Gem,

    massage_salon: HandHeart,
    spa: Flower2,

    fitness: Dumbbell,
    yoga_studio: Flower,
    pilates_studio: PersonStanding,
    dance_studio: Drama,
    sports_coaching: Trophy,

    medical_clinic: Stethoscope,
    dental_clinic: Smile,
    physiotherapy: Accessibility,
    nutritionist: Salad,
    optician: Glasses,
    chiropractor: Bone,
    speech_therapy: Speech,
    alternative_medicine: Leaf,

    psychologist: Brain,
    psychotherapist: Sofa,
    counsellor: MessagesSquare,
    life_coach: Target,

    veterinary_clinic: PawPrint,
    pet_grooming: Bath,
    dog_training: Dog,

    online_tutoring: Laptop,
    private_tutoring: BookOpen,
    language_school: Languages,
    music_lessons: Music,
    driving_school: Car,

    consulting: BriefcaseBusiness,
    photography: Camera,
    legal_services: Gavel,
    accounting: Calculator,
    real_estate: House,
    event_planning: PartyPopper,
    design_creative: Palette,

    automotive_repair: Wrench,
    car_wash: CarFront,
    cleaning_services: Droplets,
    handyman: Hammer,

    other: GENERIC_SERVICE_ICON,
};

/** The icon that stands for what a business does, for use next to its services. */
export function businessCategoryIcon(category?: string | null): LucideIcon {
    return (
        (category ? BUSINESS_CATEGORY_ICONS[category] : undefined) ??
        GENERIC_SERVICE_ICON
    );
}

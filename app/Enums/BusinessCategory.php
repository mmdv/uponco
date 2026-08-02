<?php

namespace App\Enums;

enum BusinessCategory: string
{
    case Hairdresser = 'hairdresser';
    case Barbershop = 'barbershop';

    case BeautySalon = 'beauty_salon';
    case NailSalon = 'nail_salon';
    case LashesBrows = 'lashes_brows';
    case MakeupArtist = 'makeup_artist';
    case SkinCareClinic = 'skin_care_clinic';
    case HairRemoval = 'hair_removal';
    case TattooStudio = 'tattoo_studio';
    case PiercingStudio = 'piercing_studio';

    case MassageSalon = 'massage_salon';
    case Spa = 'spa';

    case Fitness = 'fitness';
    case YogaStudio = 'yoga_studio';
    case PilatesStudio = 'pilates_studio';
    case DanceStudio = 'dance_studio';
    case SportsCoaching = 'sports_coaching';

    case MedicalClinic = 'medical_clinic';
    case DentalClinic = 'dental_clinic';
    case Physiotherapy = 'physiotherapy';
    case Nutritionist = 'nutritionist';
    case Optician = 'optician';
    case Chiropractor = 'chiropractor';
    case SpeechTherapy = 'speech_therapy';
    case AlternativeMedicine = 'alternative_medicine';

    case Psychologist = 'psychologist';
    case Psychotherapist = 'psychotherapist';
    case Counsellor = 'counsellor';
    case LifeCoach = 'life_coach';

    case VeterinaryClinic = 'veterinary_clinic';
    case PetGrooming = 'pet_grooming';
    case DogTraining = 'dog_training';

    case OnlineTutoring = 'online_tutoring';
    case PrivateTutoring = 'private_tutoring';
    case LanguageSchool = 'language_school';
    case MusicLessons = 'music_lessons';
    case DrivingSchool = 'driving_school';

    case Consulting = 'consulting';
    case Photography = 'photography';
    case LegalServices = 'legal_services';
    case Accounting = 'accounting';
    case RealEstate = 'real_estate';
    case EventPlanning = 'event_planning';
    case DesignCreative = 'design_creative';

    case AutomotiveRepair = 'automotive_repair';
    case CarWash = 'car_wash';
    case CleaningServices = 'cleaning_services';
    case Handyman = 'handyman';

    case Other = 'other';

    /**
     * The order sections are presented in, with the catch-all pinned last.
     *
     * @var list<string>
     */
    private const GROUP_ORDER = [
        'Hair & barbering',
        'Beauty & skincare',
        'Wellness & spa',
        'Fitness & sport',
        'Health & medical',
        'Mental health & coaching',
        'Pets',
        'Education',
        'Professional services',
        'Home & auto',
        'Other',
    ];

    /**
     * Get the display label for the category.
     */
    public function label(): string
    {
        return match ($this) {
            self::Hairdresser => 'Hairdresser',
            self::Barbershop => 'Barbershop',

            self::BeautySalon => 'Beauty salon',
            self::NailSalon => 'Nail salon',
            self::LashesBrows => 'Lashes & brows',
            self::MakeupArtist => 'Makeup artist',
            self::SkinCareClinic => 'Skincare & aesthetics',
            self::HairRemoval => 'Waxing & hair removal',
            self::TattooStudio => 'Tattoo studio',
            self::PiercingStudio => 'Piercing studio',

            self::MassageSalon => 'Massage salon',
            self::Spa => 'Spa',

            self::Fitness => 'Fitness & personal training',
            self::YogaStudio => 'Yoga studio',
            self::PilatesStudio => 'Pilates studio',
            self::DanceStudio => 'Dance studio',
            self::SportsCoaching => 'Sports coaching',

            self::MedicalClinic => 'Medical clinic',
            self::DentalClinic => 'Dental clinic',
            self::Physiotherapy => 'Physiotherapy',
            self::Nutritionist => 'Nutritionist & dietitian',
            self::Optician => 'Optician',
            self::Chiropractor => 'Chiropractor & osteopath',
            self::SpeechTherapy => 'Speech therapy',
            self::AlternativeMedicine => 'Alternative medicine',

            self::Psychologist => 'Psychologist',
            self::Psychotherapist => 'Psychotherapist',
            self::Counsellor => 'Counsellor',
            self::LifeCoach => 'Life & career coach',

            self::VeterinaryClinic => 'Veterinary clinic',
            self::PetGrooming => 'Pet grooming',
            self::DogTraining => 'Dog training',

            self::OnlineTutoring => 'Online tutoring',
            self::PrivateTutoring => 'Private tutoring',
            self::LanguageSchool => 'Language school',
            self::MusicLessons => 'Music lessons',
            self::DrivingSchool => 'Driving school',

            self::Consulting => 'Consulting',
            self::Photography => 'Photography',
            self::LegalServices => 'Legal services',
            self::Accounting => 'Accounting & tax',
            self::RealEstate => 'Real estate',
            self::EventPlanning => 'Event planning',
            self::DesignCreative => 'Design & creative',

            self::AutomotiveRepair => 'Automotive repair',
            self::CarWash => 'Car wash & detailing',
            self::CleaningServices => 'Cleaning services',
            self::Handyman => 'Repairs & handyman',

            self::Other => 'Other',
        };
    }

    /**
     * Get the section the category is listed under in the picker.
     */
    public function group(): string
    {
        return match ($this) {
            self::Hairdresser, self::Barbershop => 'Hair & barbering',

            self::BeautySalon, self::NailSalon, self::LashesBrows, self::MakeupArtist,
            self::SkinCareClinic, self::HairRemoval, self::TattooStudio, self::PiercingStudio => 'Beauty & skincare',

            self::MassageSalon, self::Spa => 'Wellness & spa',

            self::Fitness, self::YogaStudio, self::PilatesStudio,
            self::DanceStudio, self::SportsCoaching => 'Fitness & sport',

            self::MedicalClinic, self::DentalClinic, self::Physiotherapy, self::Nutritionist,
            self::Optician, self::Chiropractor, self::SpeechTherapy, self::AlternativeMedicine => 'Health & medical',

            self::Psychologist, self::Psychotherapist,
            self::Counsellor, self::LifeCoach => 'Mental health & coaching',

            self::VeterinaryClinic, self::PetGrooming, self::DogTraining => 'Pets',

            self::OnlineTutoring, self::PrivateTutoring, self::LanguageSchool,
            self::MusicLessons, self::DrivingSchool => 'Education',

            self::Consulting, self::Photography, self::LegalServices, self::Accounting,
            self::RealEstate, self::EventPlanning, self::DesignCreative => 'Professional services',

            self::AutomotiveRepair, self::CarWash,
            self::CleaningServices, self::Handyman => 'Home & auto',

            self::Other => 'Other',
        };
    }

    /**
     * Get the list of selectable categories, grouped into sections and sorted
     * by label within each one.
     *
     * @return list<array{value: string, label: string, group: string}>
     */
    public static function options(): array
    {
        $options = array_map(fn (self $category): array => [
            'value' => $category->value,
            'label' => $category->label(),
            'group' => $category->group(),
        ], self::cases());

        usort($options, function (array $a, array $b): int {
            $group = array_search($a['group'], self::GROUP_ORDER, true) <=> array_search($b['group'], self::GROUP_ORDER, true);

            return $group !== 0 ? $group : strcmp($a['label'], $b['label']);
        });

        return $options;
    }

    /**
     * Get the list of valid category values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $category): string => $category->value, self::cases());
    }
}

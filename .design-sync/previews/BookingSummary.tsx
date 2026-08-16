import { Scissors, Sparkles } from 'lucide-react';
import { BookingSummary } from 'uponco';

export function FullRecap() {
    return (
        <div className="w-96">
            <BookingSummary
                serviceTitle="Deep Tissue Massage"
                metaLabel="60 min · ₼85"
                specialistName="Leyla Mammadova"
                locationName="Lotus Wellness · Nizami 42"
                dateTimeLabel="Tuesday, 19 August · 11:30"
                serviceIcon={Sparkles}
            />
        </div>
    );
}

export function AnySpecialist() {
    return (
        <div className="w-96">
            <BookingSummary
                serviceTitle="Gel Manicure"
                metaLabel="45 min · ₼40"
                locationName="Aurora Studio · Fountain Sq."
                dateTimeLabel="Saturday, 23 August · 14:00"
                serviceIcon={Scissors}
            />
        </div>
    );
}

export function ServiceOnly() {
    return (
        <div className="w-96">
            <BookingSummary
                serviceTitle="Balayage & Blow Dry"
                metaLabel="150 min · £145"
            />
        </div>
    );
}

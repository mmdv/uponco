import { Sparkles, Stethoscope } from 'lucide-react';
import { SuccessScreen } from 'uponco';

const CALENDAR = {
    title: 'Deep Tissue Massage · Lotus Wellness',
    start: '2026-08-16T11:30:00+04:00',
    end: '2026-08-16T12:30:00+04:00',
    location: '28 May Street 12, Baku',
    description: 'With Leyla Aliyeva. Please arrive five minutes early.',
};

export function Default() {
    return (
        <div className="w-full max-w-md">
            <SuccessScreen
                companyName="Lotus Wellness"
                customerName="Ayla Rzayeva"
                summary={{
                    serviceTitle: 'Deep Tissue Massage',
                    metaLabel: '60 min · ₼75',
                    specialistName: 'Leyla Aliyeva',
                    locationName: 'Nizami Street Studio',
                    dateTimeLabel: 'Sunday 16 August · 11:30',
                }}
                calendar={CALENDAR}
                serviceIcon={Sparkles}
                onBookAnother={() => {}}
            />
        </div>
    );
}

export function WithoutCalendar() {
    return (
        <div className="w-full max-w-md">
            <SuccessScreen
                companyName="Baku Dental Studio"
                customerName="Kamran Hasanov"
                summary={{
                    serviceTitle: 'Hygienist Check-up',
                    metaLabel: '30 min · ₼60',
                    specialistName: 'Dr Nigar Mammadova',
                    locationName: 'Fountain Square Clinic',
                    dateTimeLabel: 'Tuesday 18 August · 09:15',
                }}
                calendar={null}
                serviceIcon={Stethoscope}
                onBookAnother={() => {}}
            />
        </div>
    );
}

export function OnlineAppointment() {
    return (
        <div className="w-full max-w-md">
            <SuccessScreen
                companyName="Lotus Wellness"
                customerName="Nigar"
                summary={{
                    serviceTitle: 'Nutrition Consultation',
                    metaLabel: '45 min · ₼50',
                    specialistName: 'Leyla Aliyeva',
                    locationName: null,
                    dateTimeLabel: 'Thursday 20 August · 17:00',
                }}
                calendar={CALENDAR}
                onBookAnother={() => {}}
            />
        </div>
    );
}

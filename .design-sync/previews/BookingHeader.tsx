import { BookingHeader } from 'uponco';

export function SalonHeader() {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-4">
            <BookingHeader
                companyName="Bella Salon"
                tagline="Hair, nails and skin — Nizami, Baku"
                theme="light"
                onThemeChange={() => {}}
            />
        </div>
    );
}

export function SoloPractitioner() {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-4">
            <BookingHeader
                companyName="Leyla Aliyeva Therapy"
                headline="Leyla Aliyeva"
                tagline="Deep tissue and sports massage"
                backUrl="/bella-salon"
                theme="light"
                onThemeChange={() => {}}
            />
        </div>
    );
}

export function WithoutMenu() {
    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-4">
            <BookingHeader
                companyName="Bella Salon"
                tagline="Hair, nails and skin — Nizami, Baku"
                theme="light"
                onThemeChange={() => {}}
                showMenu={false}
            />
        </div>
    );
}

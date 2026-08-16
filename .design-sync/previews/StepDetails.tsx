import { StepDetails } from 'uponco';

const EMPTY = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: '',
};

const FILLED = {
    customer_name: 'Ayla Rzayeva',
    customer_email: 'ayla.rzayeva@gmail.com',
    customer_phone: '+994502331804',
    notes: 'Please use unscented oil — allergic to lavender.',
};

export function EmptyForm() {
    return (
        <div className="mx-auto w-full max-w-md">
            <StepDetails values={EMPTY} onChange={() => {}} errors={{}} />
        </div>
    );
}

export function FilledIn() {
    return (
        <div className="mx-auto w-full max-w-md">
            <StepDetails values={FILLED} onChange={() => {}} errors={{}} />
        </div>
    );
}

export function WithValidationErrors() {
    return (
        <div className="mx-auto w-full max-w-md">
            <StepDetails
                values={{
                    ...FILLED,
                    customer_email: 'ayla.rzayeva@',
                    customer_phone: '',
                }}
                onChange={() => {}}
                errors={{
                    customer_email: 'Enter a valid email address.',
                    customer_phone: 'A phone number is required to confirm.',
                }}
            />
        </div>
    );
}

export function BookingConflict() {
    return (
        <div className="mx-auto w-full max-w-md">
            <StepDetails
                values={FILLED}
                onChange={() => {}}
                errors={{
                    booking_conflict:
                        'That 09:30 slot was just taken. Pick another time to continue.',
                }}
            />
        </div>
    );
}

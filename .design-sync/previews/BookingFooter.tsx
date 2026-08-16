import { BookingFooter } from 'uponco';

const noop = () => {};

function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-[380px] overflow-hidden rounded-xl border bg-background">
            <div className="space-y-1 border-b px-5 py-4">
                <p className="text-sm font-semibold">Aurora Beauty Studio</p>
                <p className="text-xs text-muted-foreground">
                    Deep Tissue Massage · 1 hr 30 min · 120 ₼
                </p>
            </div>
            <div className="px-5 py-6 text-sm text-muted-foreground">
                Choose a time that suits you and we&apos;ll hold the slot while
                you confirm.
            </div>
            {children}
        </div>
    );
}

export function FirstStep() {
    return (
        <PhoneFrame>
            <BookingFooter
                embedded
                step={0}
                canContinue
                processing={false}
                onBack={noop}
                onContinue={noop}
                onSubmit={noop}
            />
        </PhoneFrame>
    );
}

export function WithBackButton() {
    return (
        <PhoneFrame>
            <BookingFooter
                embedded
                step={1}
                canContinue
                processing={false}
                onBack={noop}
                onContinue={noop}
                onSubmit={noop}
                continueLabel="Pick a time"
            />
        </PhoneFrame>
    );
}

export function CannotContinue() {
    return (
        <PhoneFrame>
            <BookingFooter
                embedded
                step={1}
                canContinue={false}
                processing={false}
                onBack={noop}
                onContinue={noop}
                onSubmit={noop}
            />
        </PhoneFrame>
    );
}

export function ConfirmStep() {
    return (
        <PhoneFrame>
            <BookingFooter
                embedded
                step={2}
                canContinue
                processing={false}
                onBack={noop}
                onContinue={noop}
                onSubmit={noop}
            />
        </PhoneFrame>
    );
}

export function Submitting() {
    return (
        <PhoneFrame>
            <BookingFooter
                embedded
                step={2}
                canContinue
                processing
                onBack={noop}
                onContinue={noop}
                onSubmit={noop}
            />
        </PhoneFrame>
    );
}

import {
    Button,
    InputError,
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
    InputOTPSlot as Slot,
} from 'uponco';

const OTP_MAX_LENGTH = 6;

function Slots({ length = OTP_MAX_LENGTH }: { length?: number }) {
    return Array.from({ length }, (_, index) => (
        <Slot key={index} index={index} />
    ));
}

/** The two-factor challenge: six digits from the authenticator app. */
export function Filled() {
    return (
        <InputOTP
            name="code"
            maxLength={OTP_MAX_LENGTH}
            value="482913"
            onChange={() => undefined}
        >
            <InputOTPGroup>
                <Slots />
            </InputOTPGroup>
        </InputOTP>
    );
}

/** Before anything is typed, every slot is empty. */
export function Empty() {
    return (
        <InputOTP
            name="code"
            maxLength={OTP_MAX_LENGTH}
            value=""
            onChange={() => undefined}
        >
            <InputOTPGroup>
                <Slots />
            </InputOTPGroup>
        </InputOTP>
    );
}

/** Split into two groups with a separator between them. */
export function Grouped() {
    return (
        <InputOTP
            name="code"
            maxLength={OTP_MAX_LENGTH}
            value="482913"
            onChange={() => undefined}
        >
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    );
}

/** Disabled while the challenge is being submitted. */
export function Submitting() {
    return (
        <div className="flex max-w-sm flex-col items-center gap-3">
            <InputOTP
                name="code"
                maxLength={OTP_MAX_LENGTH}
                value="482913"
                disabled
                onChange={() => undefined}
            >
                <InputOTPGroup>
                    <Slots />
                </InputOTPGroup>
            </InputOTP>
            <Button className="w-full" disabled>
                Continue
            </Button>
        </div>
    );
}

/** A rejected code, as the two-factor challenge page renders it. */
export function WithError() {
    return (
        <div className="flex flex-col items-center gap-3 text-center">
            <InputOTP
                name="code"
                maxLength={OTP_MAX_LENGTH}
                value="100200"
                onChange={() => undefined}
            >
                <InputOTPGroup>
                    <Slots />
                </InputOTPGroup>
            </InputOTP>
            <InputError message="The provided two-factor authentication code was invalid." />
        </div>
    );
}

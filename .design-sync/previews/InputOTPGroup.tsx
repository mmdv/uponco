import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from 'uponco';

export function Default() {
    return (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
            <p className="font-semibold">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
            </p>
            <InputOTP maxLength={6} value="482915" onChange={() => {}}>
                <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot key={index} index={index} />
                    ))}
                </InputOTPGroup>
            </InputOTP>
        </div>
    );
}

export function SplitGroups() {
    return (
        <InputOTP maxLength={6} value="482915" onChange={() => {}}>
            <InputOTPGroup>
                {[0, 1, 2].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                {[3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export function Disabled() {
    return (
        <InputOTP maxLength={6} value="4829" onChange={() => {}} disabled>
            <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

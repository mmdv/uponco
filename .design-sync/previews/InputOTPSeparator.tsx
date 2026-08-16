import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from 'uponco';

export function ThreeAndThree() {
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

export function PairedGroups() {
    return (
        <InputOTP maxLength={6} value="482915" onChange={() => {}}>
            <InputOTPGroup>
                {[0, 1].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                {[2, 3].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                {[4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export function InTwoFactorCard() {
    return (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
            <p className="font-semibold">Confirm it&apos;s you</p>
            <p className="text-sm text-muted-foreground">
                We sent a code to the authenticator app on your phone.
            </p>
            <InputOTP maxLength={6} value="4829" onChange={() => {}}>
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
        </div>
    );
}

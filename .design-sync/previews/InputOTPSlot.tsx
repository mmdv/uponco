import { InputOTP, InputOTPGroup, InputOTPSlot } from 'uponco';

export function Filled() {
    return (
        <InputOTP maxLength={6} value="482915" onChange={() => {}}>
            <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export function Empty() {
    return (
        <InputOTP maxLength={6} value="" onChange={() => {}}>
            <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export function PartiallyFilled() {
    return (
        <InputOTP maxLength={6} value="482" onChange={() => {}}>
            <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export function WithError() {
    return (
        <div className="flex flex-col items-start gap-2">
            <InputOTP maxLength={6} value="112233" onChange={() => {}}>
                <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                            key={index}
                            index={index}
                            className="border-destructive text-destructive"
                        />
                    ))}
                </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-destructive">
                That code is not valid. Try the newest one in your app.
            </p>
        </div>
    );
}

import { Label, NumericInput } from 'uponco';

export function PriceField() {
    return (
        <div className="grid w-64 gap-2">
            <Label htmlFor="service-price">Price (₼)</Label>
            <NumericInput
                id="service-price"
                decimal
                value="85.00"
                onChange={() => {}}
            />
            <p className="text-xs text-muted-foreground">
                Shown on your booking page as ₼85.
            </p>
        </div>
    );
}

export function DurationField() {
    return (
        <div className="grid w-64 gap-2">
            <Label htmlFor="service-duration">Duration (minutes)</Label>
            <NumericInput
                id="service-duration"
                value="60"
                onChange={() => {}}
            />
        </div>
    );
}

export function PricingRow() {
    return (
        <div className="grid w-[28rem] grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="deposit">Deposit (₼)</Label>
                <NumericInput
                    id="deposit"
                    decimal
                    value="20.50"
                    onChange={() => {}}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="buffer">Buffer after (minutes)</Label>
                <NumericInput
                    id="buffer"
                    placeholder="0"
                    value=""
                    onChange={() => {}}
                />
            </div>
        </div>
    );
}

export function InvalidAndDisabled() {
    return (
        <div className="grid w-64 gap-5">
            <div className="grid gap-2">
                <Label htmlFor="group-size">Group size</Label>
                <NumericInput
                    id="group-size"
                    aria-invalid
                    value="0"
                    onChange={() => {}}
                />
                <p className="text-xs text-destructive">
                    A group class needs at least 2 places.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="synced-price">Price (₼)</Label>
                <NumericInput
                    id="synced-price"
                    disabled
                    decimal
                    value="45.00"
                    onChange={() => {}}
                />
                <p className="text-xs text-muted-foreground">
                    Inherited from the service.
                </p>
            </div>
        </div>
    );
}

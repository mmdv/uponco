import { CurrencySelect, Input, Label } from 'uponco';

const CURRENCIES = [
    { value: 'AZN', label: '₼ AZN' },
    { value: 'GBP', label: '£ GBP' },
    { value: 'USD', label: '$ USD' },
];

export function BesideAPriceInput() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="price">Price</Label>
            <div className="flex gap-2">
                <Input id="price" defaultValue="80" inputMode="decimal" />
                <CurrencySelect
                    id="currency"
                    name="currency"
                    value="AZN"
                    onChange={() => {}}
                    options={CURRENCIES}
                    label="Currency"
                    className="w-24"
                />
            </div>
            <p className="text-sm text-muted-foreground">
                What a Deep Tissue Massage costs at Bella Salon.
            </p>
        </div>
    );
}

export function PoundSelected() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="price-gbp">Price</Label>
            <div className="flex gap-2">
                <Input id="price-gbp" defaultValue="45" inputMode="decimal" />
                <CurrencySelect
                    id="currency-gbp"
                    value="GBP"
                    onChange={() => {}}
                    options={CURRENCIES}
                    label="Currency"
                    className="w-24"
                />
            </div>
        </div>
    );
}

export function Disabled() {
    return (
        <div className="grid max-w-sm gap-2">
            <Label htmlFor="price-free">Price</Label>
            <div className="flex gap-2">
                <Input id="price-free" defaultValue="0" disabled />
                <CurrencySelect
                    id="currency-free"
                    value="AZN"
                    onChange={() => {}}
                    options={CURRENCIES}
                    label="Currency"
                    className="w-24"
                    disabled
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Free consultations have no currency to set.
            </p>
        </div>
    );
}

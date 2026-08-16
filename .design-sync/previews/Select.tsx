import {
    Label,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from 'uponco';

export function ServicePickerOpen() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="appointment-service">Service</Label>
            <Select open value="deep-tissue">
                <SelectTrigger id="appointment-service" className="w-full">
                    <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectGroup>
                        <SelectLabel>Massage</SelectLabel>
                        <SelectItem value="deep-tissue">
                            Deep Tissue Massage · 60 min
                        </SelectItem>
                        <SelectItem value="hot-stone">
                            Hot Stone Therapy · 90 min
                        </SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel>Nails</SelectLabel>
                        <SelectItem value="gel-manicure">
                            Gel Manicure · 45 min
                        </SelectItem>
                        <SelectItem value="pedicure">
                            Classic Pedicure · 50 min
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function ClosedInAFormRow() {
    return (
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="closed-specialist">Specialist</Label>
                <Select value="ayla">
                    <SelectTrigger id="closed-specialist" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ayla">Ayla Rzayeva</SelectItem>
                        <SelectItem value="kamran">Kamran Aliyev</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="closed-location">Location</Label>
                <Select>
                    <SelectTrigger id="closed-location" className="w-full">
                        <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nizami">
                            Nizami Street Studio
                        </SelectItem>
                        <SelectItem value="port-baku">
                            Port Baku Kiosk
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function DisabledWhileServiceIsLocked() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="locked-service">Service</Label>
            <Select value="deep-tissue" disabled>
                <SelectTrigger id="locked-service" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="deep-tissue">
                        Deep Tissue Massage · 60 min
                    </SelectItem>
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
                The service came from the booking link and cannot be changed.
            </p>
        </div>
    );
}

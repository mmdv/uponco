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

export function ServicesGroupedByCategory() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="group-service">Service</Label>
            <Select open value="beard-trim">
                <SelectTrigger id="group-service" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectGroup>
                        <SelectLabel>Massage</SelectLabel>
                        <SelectItem value="deep-tissue">
                            Deep Tissue Massage
                        </SelectItem>
                        <SelectItem value="hot-stone">
                            Hot Stone Therapy
                        </SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel>Barbering</SelectLabel>
                        <SelectItem value="beard-trim">Beard Trim</SelectItem>
                        <SelectItem value="skin-fade">Skin Fade</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel>Nails</SelectLabel>
                        <SelectItem value="gel-manicure">
                            Gel Manicure
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function SingleGroupOfBranches() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="group-location">Location</Label>
            <Select open value="nizami">
                <SelectTrigger id="group-location" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectGroup>
                        <SelectLabel>Baku</SelectLabel>
                        <SelectItem value="nizami">
                            Nizami Street Studio
                        </SelectItem>
                        <SelectItem value="port-baku">
                            Port Baku Kiosk
                        </SelectItem>
                        <SelectItem value="white-city">
                            White City Salon
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

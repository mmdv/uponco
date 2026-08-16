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

export function CategoryHeadings() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="label-service">Service</Label>
            <Select open value="hot-stone">
                <SelectTrigger id="label-service" className="w-full">
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
                        <SelectLabel>Skincare</SelectLabel>
                        <SelectItem value="facial">Signature Facial</SelectItem>
                        <SelectItem value="peel">Glycolic Peel</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function CityHeadingsOverBranches() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="label-location">Location</Label>
            <Select open value="ganja-central">
                <SelectTrigger id="label-location" className="w-full">
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
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel>Ganja</SelectLabel>
                        <SelectItem value="ganja-central">
                            Ganja Central
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

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

export function SpecialistList() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="content-specialist">Specialist</Label>
            <Select open value="ayla">
                <SelectTrigger id="content-specialist" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectItem value="any">Any available</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="ayla">Ayla Rzayeva</SelectItem>
                    <SelectItem value="kamran">Kamran Aliyev</SelectItem>
                    <SelectItem value="leyla">Leyla Hasanova</SelectItem>
                    <SelectItem value="nurlan" disabled>
                        Nurlan Quliyev (on leave)
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export function GroupedServices() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="content-service">Service</Label>
            <Select open value="gel-manicure">
                <SelectTrigger id="content-service" className="w-full">
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
                        <SelectLabel>Nails</SelectLabel>
                        <SelectItem value="gel-manicure">
                            Gel Manicure
                        </SelectItem>
                        <SelectItem value="pedicure">
                            Classic Pedicure
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function AlignedAboveTheTrigger() {
    return (
        <div className="flex w-full justify-end">
            <div className="grid w-64 gap-2">
                <Label htmlFor="content-duration">Slot length</Label>
                <Select open value="60">
                    <SelectTrigger id="content-duration" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        side="top"
                        align="end"
                        className="relative"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

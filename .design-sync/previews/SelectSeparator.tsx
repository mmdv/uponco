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

export function BetweenServiceCategories() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="sep-service">Service</Label>
            <Select open value="skin-fade">
                <SelectTrigger id="sep-service" className="w-full">
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
                </SelectContent>
            </Select>
        </div>
    );
}

export function SplittingOffTheAnyOption() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="sep-specialist">Specialist</Label>
            <Select open value="any">
                <SelectTrigger id="sep-specialist" className="w-full">
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
                </SelectContent>
            </Select>
        </div>
    );
}

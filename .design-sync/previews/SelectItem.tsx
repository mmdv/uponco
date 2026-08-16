import { MapPin, Video } from 'lucide-react';
import {
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'uponco';

export function SelectedAndDisabledItems() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="item-specialist">Specialist</Label>
            <Select open value="kamran">
                <SelectTrigger id="item-specialist" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
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

export function ItemsWithLeadingIcons() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="item-delivery">How is it delivered?</Label>
            <Select open value="in-person">
                <SelectTrigger id="item-delivery" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectItem value="in-person">
                        <MapPin />
                        At the salon
                    </SelectItem>
                    <SelectItem value="online">
                        <Video />
                        Online consultation
                    </SelectItem>
                    <SelectItem value="home">
                        <MapPin />
                        At the customer&rsquo;s address
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export function TwoLineItems() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="item-slot">Start time</Label>
            <Select open value="11:30">
                <SelectTrigger id="item-slot" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectItem value="09:00">
                        <span className="flex flex-col">
                            <span>09:00</span>
                            <span className="text-xs text-muted-foreground">
                                Ayla Rzayeva · Nizami Street Studio
                            </span>
                        </span>
                    </SelectItem>
                    <SelectItem value="11:30">
                        <span className="flex flex-col">
                            <span>11:30</span>
                            <span className="text-xs text-muted-foreground">
                                Ayla Rzayeva · Nizami Street Studio
                            </span>
                        </span>
                    </SelectItem>
                    <SelectItem value="15:00">
                        <span className="flex flex-col">
                            <span>15:00</span>
                            <span className="text-xs text-muted-foreground">
                                Kamran Aliyev · Port Baku Kiosk
                            </span>
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

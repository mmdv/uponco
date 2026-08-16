import { MapPin } from 'lucide-react';
import {
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'uponco';

export function PlaceholderVersusValue() {
    return (
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="value-empty">Location</Label>
                <Select>
                    <SelectTrigger id="value-empty" className="w-full">
                        <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nizami">
                            Nizami Street Studio
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="value-filled">Location</Label>
                <Select value="nizami">
                    <SelectTrigger id="value-filled" className="w-full">
                        <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nizami">
                            Nizami Street Studio
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function ValueWithAnIcon() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="value-icon">Location</Label>
            <Select value="port-baku">
                <SelectTrigger id="value-icon" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="nizami">
                        <MapPin />
                        Nizami Street Studio
                    </SelectItem>
                    <SelectItem value="port-baku">
                        <MapPin />
                        Port Baku Kiosk
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export function LongValueClamped() {
    return (
        <div className="grid w-56 gap-2">
            <Label htmlFor="value-long">Service</Label>
            <Select value="aromatherapy">
                <SelectTrigger id="value-long" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="aromatherapy">
                        Aromatherapy Full Body Massage · 90 min · ₼140
                    </SelectItem>
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
                Long service names clamp to a single line on the trigger.
            </p>
        </div>
    );
}

import {
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'uponco';

const TIMEZONES = [
    'Europe/London',
    'Europe/Dublin',
    'Europe/Lisbon',
    'Europe/Madrid',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Vienna',
    'Europe/Prague',
    'Europe/Warsaw',
    'Europe/Athens',
    'Europe/Bucharest',
    'Europe/Helsinki',
    'Europe/Kyiv',
    'Europe/Istanbul',
    'Europe/Moscow',
    'Asia/Tbilisi',
    'Asia/Yerevan',
    'Asia/Baku',
    'Asia/Tehran',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Tashkent',
    'Asia/Almaty',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Tokyo',
];

const SLOTS = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
];

export function MoreTimezonesBelow() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="scroll-down-timezone">Business timezone</Label>
            <Select open value="Europe/London">
                <SelectTrigger id="scroll-down-timezone" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative max-h-64"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    {TIMEZONES.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                            {zone.replace('_', ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function MoreSlotsBelow() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="scroll-down-slot">Start time</Label>
            <Select open value="09:00">
                <SelectTrigger id="scroll-down-slot" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative max-h-64"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    {SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                            {slot}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

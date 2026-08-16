import { Avatar, AvatarFallback, AvatarImage } from 'uponco';

function portrait(from: string, to: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
        </linearGradient></defs>
        <rect width="96" height="96" fill="url(#g)"/>
        <circle cx="48" cy="36" r="15" fill="rgba(255,255,255,0.88)"/>
        <path d="M16 96c0-18 14-30 32-30s32 12 32 30z" fill="rgba(255,255,255,0.88)"/>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SpecialistRow() {
    const specialists = [
        { name: 'Nigar Aliyeva', initials: 'NA', role: 'Massage therapist' },
        { name: 'Rəşad Quliyev', initials: 'RQ', role: 'Barber' },
        { name: 'Leyla Hüseynova', initials: 'LH', role: 'Nail technician' },
    ];

    return (
        <div className="w-full max-w-sm space-y-3">
            {specialists.map((specialist) => (
                <div key={specialist.name} className="flex items-center gap-3">
                    <Avatar className="size-10">
                        <AvatarFallback className="text-sm font-medium">
                            {specialist.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {specialist.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {specialist.role}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function WithPhoto() {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Avatar className="size-12">
                <AvatarImage
                    src={portrait('#0063ff', '#3884fe')}
                    alt="Nigar Aliyeva"
                />
                <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">Nigar Aliyeva</p>
                <p className="text-xs text-muted-foreground">
                    Deep Tissue Massage · 14:30, Nizami Studio
                </p>
            </div>
        </div>
    );
}

export function Sizes() {
    return (
        <div className="flex items-end gap-6">
            <div className="space-y-2 text-center">
                <Avatar className="size-6">
                    <AvatarFallback style={{ fontSize: '0.625rem' }}>
                        NA
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Slot chip</p>
            </div>
            <div className="space-y-2 text-center">
                <Avatar>
                    <AvatarFallback className="text-xs">RQ</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Default</p>
            </div>
            <div className="space-y-2 text-center">
                <Avatar className="size-12">
                    <AvatarFallback className="text-sm">LH</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Member row</p>
            </div>
            <div className="space-y-2 text-center">
                <Avatar className="size-16">
                    <AvatarImage
                        src={portrait('#0f766e', '#2dd4bf')}
                        alt="Elvin Məmmədov"
                    />
                    <AvatarFallback>EM</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Profile</p>
            </div>
        </div>
    );
}

export function StackedTeam() {
    return (
        <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
                {['NA', 'RQ', 'LH', 'EM'].map((initials) => (
                    <Avatar
                        key={initials}
                        className="size-9 border-2 border-background"
                    >
                        <AvatarFallback className="text-xs font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                ))}
                <Avatar className="size-9 border-2 border-background">
                    <AvatarFallback className="text-xs font-medium">
                        +6
                    </AvatarFallback>
                </Avatar>
            </div>
            <p className="text-sm text-muted-foreground">
                10 specialists at Nizami Studio
            </p>
        </div>
    );
}

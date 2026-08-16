import { Avatar, AvatarFallback, AvatarImage } from 'uponco';

function portrait(from: string, to: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
        </linearGradient></defs>
        <rect width="128" height="128" fill="url(#g)"/>
        <circle cx="64" cy="50" r="22" fill="rgba(255,255,255,0.88)"/>
        <path d="M18 128c0-25 20-42 46-42s46 17 46 42z" fill="rgba(255,255,255,0.88)"/>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SpecialistCard() {
    return (
        <div className="w-full max-w-xs rounded-xl border border-border p-4 text-center">
            <Avatar className="mx-auto size-20">
                <AvatarImage src={portrait('#0063ff', '#3884fe')} alt="Nigar Aliyeva" />
                <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <p className="mt-3 text-sm font-semibold">Nigar Aliyeva</p>
            <p className="text-xs text-muted-foreground">
                Massage therapist · 8 years
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
                Next free: Thursday 14:30
            </p>
        </div>
    );
}

export function PhotoRow() {
    const people = [
        { name: 'Nigar Aliyeva', from: '#0063ff', to: '#3884fe', initials: 'NA' },
        { name: 'Rəşad Quliyev', from: '#7c3aed', to: '#c084fc', initials: 'RQ' },
        { name: 'Leyla Hüseynova', from: '#0f766e', to: '#2dd4bf', initials: 'LH' },
    ];

    return (
        <div className="w-full max-w-sm space-y-3">
            {people.map((person) => (
                <div
                    key={person.name}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                    <Avatar className="size-10">
                        <AvatarImage
                            src={portrait(person.from, person.to)}
                            alt={person.name}
                        />
                        <AvatarFallback>{person.initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium">{person.name}</p>
                </div>
            ))}
        </div>
    );
}

export function BrokenSourceFallsBack() {
    return (
        <div className="flex items-center gap-6">
            <div className="space-y-2 text-center">
                <Avatar className="size-14">
                    <AvatarImage src={portrait('#0063ff', '#3884fe')} alt="Nigar Aliyeva" />
                    <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo loads</p>
            </div>

            <div className="space-y-2 text-center">
                <Avatar className="size-14">
                    <AvatarImage src="/storage/avatars/deleted.jpg" alt="Rəşad Quliyev" />
                    <AvatarFallback>RQ</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo 404s</p>
            </div>
        </div>
    );
}

export function SquareTeamLogo() {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Avatar className="size-11 rounded-lg">
                <AvatarImage
                    src={portrait('#111827', '#4b5563')}
                    alt="Nizami Studio"
                    className="rounded-lg"
                />
                <AvatarFallback className="rounded-lg">NS</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">Nizami Studio</p>
                <p className="text-xs text-muted-foreground">
                    Baku · 10 specialists
                </p>
            </div>
        </div>
    );
}

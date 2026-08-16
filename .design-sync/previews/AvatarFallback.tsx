import { Avatar, AvatarFallback, AvatarImage } from 'uponco';

export function InitialsInMemberList() {
    const members = [
        { initials: 'NA', name: 'Nigar Aliyeva', email: 'nigar@nizamistudio.az' },
        { initials: 'RQ', name: 'Rəşad Quliyev', email: 'rashad@nizamistudio.az' },
        { initials: 'LH', name: 'Leyla Hüseynova', email: 'leyla@nizamistudio.az' },
    ];

    return (
        <div className="w-full max-w-sm divide-y divide-border rounded-xl border border-border">
            {members.map((member) => (
                <div key={member.email} className="flex items-center gap-3 p-3">
                    <Avatar className="size-9 rounded-lg">
                        <AvatarFallback className="rounded-lg text-xs font-medium">
                            {member.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {member.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {member.email}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FallbackWhenPhotoMissing() {
    return (
        <div className="flex items-center gap-6">
            <div className="space-y-2 text-center">
                <Avatar className="size-14">
                    <AvatarImage src="/storage/avatars/missing.jpg" alt="" />
                    <AvatarFallback className="text-base font-medium">
                        LH
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo missing</p>
            </div>

            <div className="space-y-2 text-center">
                <Avatar className="size-14">
                    <AvatarFallback className="text-base font-medium">
                        RQ
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">No photo set</p>
            </div>
        </div>
    );
}

export function SquareAndRound() {
    return (
        <div className="flex items-center gap-6">
            <div className="space-y-2 text-center">
                <Avatar className="size-12">
                    <AvatarFallback className="text-sm font-medium">
                        NA
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Round</p>
            </div>

            <div className="space-y-2 text-center">
                <Avatar className="size-12 rounded-lg">
                    <AvatarFallback className="rounded-lg text-sm font-medium">
                        NS
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Team logo</p>
            </div>

            <div className="space-y-2 text-center">
                <Avatar className="size-12">
                    <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
                        EM
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Tinted</p>
            </div>
        </div>
    );
}

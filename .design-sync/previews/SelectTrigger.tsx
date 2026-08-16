import {
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'uponco';

export function FilledAndEmptyTriggers() {
    return (
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="trigger-service">Service</Label>
                <Select value="deep-tissue">
                    <SelectTrigger id="trigger-service" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="deep-tissue">
                            Deep Tissue Massage
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="trigger-specialist">Specialist</Label>
                <Select>
                    <SelectTrigger id="trigger-specialist" className="w-full">
                        <SelectValue placeholder="Any available" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ayla">Ayla Rzayeva</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function SmallTriggerInAToolbar() {
    return (
        <div className="flex w-full max-w-lg items-center gap-3 rounded-xl border bg-card p-3">
            <span className="text-sm font-medium">Appointments</span>
            <div className="ml-auto flex items-center gap-2">
                <Select value="week">
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                </Select>
                <Select value="all">
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All specialists</SelectItem>
                        <SelectItem value="ayla">Ayla Rzayeva</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function InvalidAndDisabled() {
    return (
        <div className="grid w-72 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="trigger-invalid">Location</Label>
                <Select>
                    <SelectTrigger
                        id="trigger-invalid"
                        aria-invalid
                        className="w-full"
                    >
                        <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="nizami">
                            Nizami Street Studio
                        </SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-sm text-destructive">
                    Pick where this appointment happens.
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="trigger-disabled">Currency</Label>
                <Select value="AZN" disabled>
                    <SelectTrigger id="trigger-disabled" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="AZN">₼ AZN</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function OpenTriggerWithTheListShowing() {
    return (
        <div className="grid w-72 gap-2">
            <Label htmlFor="trigger-open">Specialist</Label>
            <Select open value="leyla">
                <SelectTrigger id="trigger-open" className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="relative"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                >
                    <SelectItem value="ayla">Ayla Rzayeva</SelectItem>
                    <SelectItem value="kamran">Kamran Aliyev</SelectItem>
                    <SelectItem value="leyla">Leyla Hasanova</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

import { Label, Switch } from 'uponco';

export function NotificationSettings() {
    return (
        <div className="w-96 divide-y rounded-xl border">
            <div className="flex items-center justify-between gap-4 p-4">
                <div>
                    <Label htmlFor="email-confirmations">
                        Email confirmations
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Send the customer a receipt when a booking is made.
                    </p>
                </div>
                <Switch
                    id="email-confirmations"
                    checked
                    onCheckedChange={() => {}}
                />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
                <div>
                    <Label htmlFor="sms-reminders">SMS reminders</Label>
                    <p className="text-xs text-muted-foreground">
                        A text 24 hours before the appointment.
                    </p>
                </div>
                <Switch
                    id="sms-reminders"
                    checked={false}
                    onCheckedChange={() => {}}
                />
            </div>
        </div>
    );
}

export function States() {
    return (
        <div className="grid gap-4">
            <div className="flex items-center gap-3">
                <Switch checked onCheckedChange={() => {}} />
                <span className="text-sm">On — accepting online bookings</span>
            </div>
            <div className="flex items-center gap-3">
                <Switch checked={false} onCheckedChange={() => {}} />
                <span className="text-sm">Off — bookings paused</span>
            </div>
            <div className="flex items-center gap-3">
                <Switch checked disabled onCheckedChange={() => {}} />
                <span className="text-sm text-muted-foreground">
                    Disabled on — required by your plan
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Switch checked={false} disabled onCheckedChange={() => {}} />
                <span className="text-sm text-muted-foreground">
                    Disabled off — no card on file
                </span>
            </div>
        </div>
    );
}

export function InlineToggle() {
    return (
        <div className="flex w-96 items-center justify-between gap-4 rounded-xl border p-4">
            <div className="flex items-center gap-3">
                <Switch
                    id="deep-tissue-active"
                    checked
                    onCheckedChange={() => {}}
                />
                <div>
                    <Label htmlFor="deep-tissue-active">
                        Deep Tissue Massage
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        60 min · ₼85
                    </p>
                </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
                Bookable
            </span>
        </div>
    );
}

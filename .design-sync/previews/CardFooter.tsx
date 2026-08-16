import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'uponco';

export function TwoActions() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Cancel this appointment?</CardTitle>
                <CardDescription>
                    Deep Tissue Massage with Nigar Aliyeva, Thursday 14:30.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                The customer will be emailed straight away and the slot goes
                back on the booking page.
            </CardContent>
            <CardFooter className="justify-end gap-3">
                <Button variant="outline">Keep it</Button>
                <Button variant="destructive">Cancel appointment</Button>
            </CardFooter>
        </Card>
    );
}

export function FullWidthAction() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Gel Manicure</CardTitle>
                <CardDescription>45 minutes · ₼40</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Next free slot: tomorrow at 11:00 with Leyla Hüseynova.
            </CardContent>
            <CardFooter>
                <Button className="w-full">Book this service</Button>
            </CardFooter>
        </Card>
    );
}

export function FooterAsMetaBar() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Reformer Pilates</CardTitle>
                <CardDescription>Group class · 12 places</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Runs Tuesdays and Thursdays at 08:00 in Nizami Studio.
            </CardContent>
            <CardFooter className="justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>Last booked 2 hours ago</span>
                <span>9 of 12 places filled</span>
            </CardFooter>
        </Card>
    );
}

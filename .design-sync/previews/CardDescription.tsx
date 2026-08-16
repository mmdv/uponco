import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from 'uponco';

export function UnderTitle() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Booking link</CardTitle>
                <CardDescription>
                    Share this with customers so they can book Deep Tissue
                    Massage themselves.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <code className="rounded-md bg-muted px-2 py-1 text-xs">
                    uponco.app/nizami-studio
                </code>
            </CardContent>
        </Card>
    );
}

export function AboveTitleAsLabel() {
    return (
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <Card className="gap-2 py-5">
                <CardHeader className="px-5">
                    <CardDescription>Average booking value</CardDescription>
                    <CardTitle className="text-2xl">₼68</CardTitle>
                </CardHeader>
            </Card>
            <Card className="gap-2 py-5">
                <CardHeader className="px-5">
                    <CardDescription>Repeat customers</CardDescription>
                    <CardTitle className="text-2xl">61%</CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

export function LongDescription() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Deposits</CardTitle>
                <CardDescription>
                    Ask customers for part of the price up front. Deposits are
                    refunded automatically if the appointment is cancelled more
                    than 24 hours before it starts, and kept otherwise.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Currently off for all services at Nizami Studio.
            </CardContent>
        </Card>
    );
}

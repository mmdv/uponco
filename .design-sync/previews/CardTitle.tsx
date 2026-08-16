import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from 'uponco';

export function InsideCardHeader() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Cancellation policy</CardTitle>
                <CardDescription>
                    Shown to customers before they confirm.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Appointments can be cancelled free of charge up to 24 hours
                before the start time.
            </CardContent>
        </Card>
    );
}

export function AsMetricValue() {
    return (
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
            <Card className="gap-2 py-5">
                <CardHeader className="px-5">
                    <CardDescription>Booked this month</CardDescription>
                    <CardTitle className="text-3xl">182</CardTitle>
                </CardHeader>
            </Card>
            <Card className="gap-2 py-5">
                <CardHeader className="px-5">
                    <CardDescription>Revenue</CardDescription>
                    <CardTitle className="text-3xl">₼12,450</CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}

export function LongTitleWraps() {
    return (
        <Card className="w-full max-w-xs">
            <CardHeader>
                <CardTitle>
                    Aromatherapy Facial with Hot Stone Finish
                </CardTitle>
                <CardDescription>
                    75 minutes · ₼95 · Nigar Aliyeva
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                The title has no clamp, so a long service name wraps onto a
                second line and the description stays put underneath.
            </CardContent>
        </Card>
    );
}

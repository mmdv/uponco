import { MoreHorizontal } from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from 'uponco';

export function TitleAndDescription() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Working hours</CardTitle>
                <CardDescription>
                    When Nizami Studio takes online bookings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>Monday – Friday · 09:00 – 19:00</p>
                <p>Saturday · 10:00 – 16:00</p>
                <p>Sunday · Closed</p>
            </CardContent>
        </Card>
    );
}

export function WithTrailingAction() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <CardTitle>Aromatherapy Facial</CardTitle>
                    <CardDescription>
                        50 minutes · ₼65 · 2 specialists
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                </Button>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Bookable at Nizami Studio and Port Baku Kiosk.
            </CardContent>
        </Card>
    );
}

export function WithStatusBadge() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Hot Stone Therapy</CardTitle>
                <Badge variant="secondary">Draft</Badge>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                Hidden from the public booking page until a price is set.
            </CardContent>
        </Card>
    );
}

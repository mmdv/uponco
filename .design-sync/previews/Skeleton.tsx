import { Card, CardContent, CardHeader, Skeleton } from 'uponco';

export function LoadingSlotGrid() {
    return (
        <div className="w-full max-w-sm space-y-3">
            <div>
                <p className="text-sm font-medium">Thursday, 21 August</p>
                <p className="text-xs text-muted-foreground">
                    Checking Nigar Aliyeva's availability…
                </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-full" />
                ))}
            </div>
        </div>
    );
}

export function LoadingSpecialistList() {
    return (
        <div className="w-full max-w-sm space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export function LoadingDashboardCard() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                </div>
            </CardContent>
        </Card>
    );
}

export function Shapes() {
    return (
        <div className="flex items-center gap-6">
            <div className="space-y-2 text-center">
                <Skeleton className="size-12 rounded-full" />
                <p className="text-xs text-muted-foreground">Avatar</p>
            </div>
            <div className="space-y-2 text-center">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <p className="text-xs text-muted-foreground">Thumbnail</p>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-32" />
                <p className="text-xs text-muted-foreground">Text lines</p>
            </div>
        </div>
    );
}

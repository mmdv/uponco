/**
 * A screen's title and its single line of explanation. Deliberately capped at
 * one sentence — anything longer pushes the first input below the fold.
 */
export default function ScreenHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

import { Button, Label, PasswordInput } from 'uponco';

export function SignInField() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
            />
        </div>
    );
}

export function ConfirmBeforeDeleting() {
    return (
        <div className="grid w-80 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="delete-password">
                    Confirm your password to delete Bella Salon
                </Label>
                <PasswordInput
                    id="delete-password"
                    name="password"
                    autoComplete="current-password"
                    defaultValue="correct-horse-battery"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button variant="destructive">Delete workspace</Button>
            </div>
        </div>
    );
}

export function WithError() {
    return (
        <div className="grid w-80 gap-2">
            <Label htmlFor="password-error">Password</Label>
            <PasswordInput
                id="password-error"
                name="password"
                aria-invalid
                defaultValue="hunter2"
            />
            <p className="text-sm text-destructive">
                These credentials do not match our records.
            </p>
        </div>
    );
}

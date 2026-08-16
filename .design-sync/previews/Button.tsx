import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from 'uponco';

export function Default() {
    return <Button>Book appointment</Button>;
}

export function Variants() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Save changes</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="outline">Cancel</Button>
            <Button variant="ghost">Skip for now</Button>
            <Button variant="destructive">Delete service</Button>
            <Button variant="link">View all bookings</Button>
        </div>
    );
}

export function Sizes() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add service">
                <Plus />
            </Button>
        </div>
    );
}

export function WithIcons() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button>
                <Plus />
                New appointment
            </Button>
            <Button variant="outline">
                Continue
                <ArrowRight />
            </Button>
            <Button variant="destructive">
                <Trash2 />
                Remove
            </Button>
        </div>
    );
}

export function Disabled() {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Save changes</Button>
            <Button variant="outline" disabled>
                Cancel
            </Button>
            <Button variant="destructive" disabled>
                Delete service
            </Button>
        </div>
    );
}

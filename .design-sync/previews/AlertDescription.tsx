import { CircleAlert, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from 'uponco';

export function InsideAlert() {
    return (
        <div className="w-full max-w-lg">
            <Alert>
                <MapPin />
                <AlertTitle>Port Baku Kiosk has no address</AlertTitle>
                <AlertDescription>
                    Customers can't get directions to this location until you
                    add a street address and pin it on the map.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function WithList() {
    return (
        <div className="w-full max-w-lg">
            <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>This service can't go live yet</AlertTitle>
                <AlertDescription>
                    <ul className="list-inside list-disc text-sm">
                        <li>Deep Tissue Massage has no price set</li>
                        <li>No specialist is assigned to it</li>
                        <li>Nizami Studio is closed on the only day it runs</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}

export function MultipleParagraphs() {
    return (
        <div className="w-full max-w-lg">
            <Alert>
                <MapPin />
                <AlertTitle>Two branches share the same phone number</AlertTitle>
                <AlertDescription>
                    <p>
                        Nizami Studio and Port Baku Kiosk both list +994 12 555
                        08 21, so confirmation emails point customers at the
                        wrong desk.
                    </p>
                    <p>
                        Give each location its own number, or remove it from the
                        one that doesn't take calls.
                    </p>
                </AlertDescription>
            </Alert>
        </div>
    );
}

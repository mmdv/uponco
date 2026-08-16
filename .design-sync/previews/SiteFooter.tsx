import { SiteFooter } from 'uponco';

export function MarketingFooter() {
    return (
        <div className="w-full">
            <SiteFooter />
        </div>
    );
}

export function UnderALegalPage() {
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-3xl px-6 pb-10">
                <h1 className="text-2xl font-semibold">Privacy Policy</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    How Uponco handles the appointment and customer data your
                    salon or clinic stores with us.
                </p>
            </div>
            <SiteFooter maxWidth="max-w-3xl" />
        </div>
    );
}
